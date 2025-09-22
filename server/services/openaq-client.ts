import axios from 'axios';
import { OpenAQRateLimiter } from '../utils/rate-limiter';

interface OpenAQCountry {
  id: number;
  code: string;
  name: string;
}

interface OpenAQLocation {
  id: number;
  name: string;
  country: {
    id: number;
    code: string;
    name: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  sensors: Array<{
    id: number;
    parameter: {
      id: number;
      name: string;
      units: string;
    };
  }>;
}

interface OpenAQMeasurement {
  value: number;
  parameter: {
    id: number;
    name: string;
    units: string;
  };
  period: {
    datetime_from: {
      utc: string;
      local: string;
    };
    datetime_to: {
      utc: string;
      local: string;
    };
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  summary?: {
    min: number;
    max: number;
    mean: number;
    median: number;
  };
}

interface OpenAQResponse<T> {
  meta: {
    name: string;
    website: string;
    page: number;
    limit: number;
    found: number;
  };
  results: T[];
}

export class OpenAQClient {
  private readonly baseUrl = 'https://api.openaq.org/v3';
  private readonly apiKey: string;
  private europeanCountryIds: number[] = [];
  private rateLimiter: OpenAQRateLimiter;

  constructor() {
    console.log("!!!!!!",process.env.TEST)
    this.apiKey = process.env.OPENAQ_API_KEY || '';
    this.rateLimiter = new OpenAQRateLimiter();
    if (!this.apiKey) {
      console.warn('⚠️ OPENAQ_API_KEY not set - OpenAQ requests will fail');
    }
  }

  /**
   * Make a rate-limited API request to OpenAQ
   */
  private async makeRateLimitedRequest<T>(url: string, params: any = {}): Promise<T> {
    // Wait if necessary to avoid rate limit violations
    await this.rateLimiter.waitIfNeeded();

    try {
      const response = await axios.get<T>(url, {
        params,
        headers: {
          'X-API-Key': this.apiKey,
          'User-Agent': 'Environmental-Monitoring-System/1.0'
        },
        timeout: 20000
      });

      // Record successful request with rate limit headers
      this.rateLimiter.recordRequest(response.headers as Record<string, string>);
      
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 429) {
        // Handle rate limit error
        await this.rateLimiter.handle429Error(error.response.headers);
        // Retry the request once after waiting
        const retryResponse = await axios.get<T>(url, {
          params,
          headers: {
            'X-API-Key': this.apiKey,
            'User-Agent': 'Environmental-Monitoring-System/1.0'
          },
          timeout: 20000
        });
        this.rateLimiter.recordRequest(retryResponse.headers as Record<string, string>);
        return retryResponse.data;
      }
      throw error;
    }
  }

  /**
   * Fetch hourly air quality data for PM2.5 and NO2 from OpenAQ v3
   * Returns data for the last hour from European stations
   */
  async fetchHourlyData(): Promise<OpenAQMeasurement[]> {
    try {
      console.log('🌐 Fetching hourly air quality data from OpenAQ v3...');
      
      if (!this.apiKey) {
        throw new Error('OpenAQ API key not configured');
      }

      // Step 1: Get European country IDs (cache for efficiency)
      if (this.europeanCountryIds.length === 0) {
        await this.loadEuropeanCountries();
      }

      // Step 2: Get locations with PM2.5 and NO2 sensors in European countries
      const locations = await this.getEuropeanLocations();
      
      if (locations.length === 0) {
        console.warn('⚠️ No European locations found with PM2.5/NO2 sensors');
        return [];
      }

      console.log(`📍 Found ${locations.length} European locations with relevant sensors`);

      // Step 3: Get recent hourly measurements from these locations
      const measurements = await this.getRecentMeasurements(locations);
      
      console.log(`✅ OpenAQ v3: Retrieved ${measurements.length} valid hourly observations`);
      return measurements;
      
    } catch (error: any) {
      console.error('❌ OpenAQ v3 API fetch failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      throw new Error(`OpenAQ API error: ${error.message}`);
    }
  }

  /**
   * Load European country IDs from OpenAQ API
   */
  private async loadEuropeanCountries(): Promise<void> {
    const europeanCodes = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'NO', 'CH'];
    
    try {
      console.log('📍 Loading European countries from OpenAQ...');
      const response = await this.makeRateLimitedRequest<OpenAQResponse<OpenAQCountry>>(
        `${this.baseUrl}/countries`, 
        { limit: 300 }
      );

      this.europeanCountryIds = response.results
        .filter(country => europeanCodes.includes(country.code))
        .map(country => country.id);
      
      console.log(`✅ Loaded ${this.europeanCountryIds.length} European country IDs from OpenAQ`);
    } catch (error: any) {
      console.error('❌ Failed to load European countries:', error.message);
      throw error;
    }
  }

  /**
   * Get locations in European countries with PM2.5 and NO2 sensors
   */
  private async getEuropeanLocations(): Promise<OpenAQLocation[]> {
    try {
      console.log('📍 Loading European monitoring locations...');
      const response = await this.makeRateLimitedRequest<OpenAQResponse<OpenAQLocation>>(
        `${this.baseUrl}/locations`,
        {
          countries_id: this.europeanCountryIds.join(','),
          parameters_id: '2,7', // 2=PM2.5, 7=NO2 (based on OpenAQ parameter IDs)
          limit: 1000,
          monitor: true, // Only reference monitors
          mobile: false  // Exclude mobile stations
        }
      );

      const validLocations = response.results.filter(location => 
        location.coordinates?.latitude && 
        location.coordinates?.longitude &&
        location.sensors?.some(sensor => 
          ['pm25', 'no2'].includes(sensor.parameter.name)
        )
      );

      console.log(`✅ Found ${validLocations.length} valid European locations`);
      return validLocations;
    } catch (error: any) {
      console.error('❌ Failed to get European locations:', error.message);
      throw error;
    }
  }

  /**
   * Get recent hourly measurements from locations using optimized batch approach
   */
  private async getRecentMeasurements(locations: OpenAQLocation[]): Promise<OpenAQMeasurement[]> {
    const measurements: OpenAQMeasurement[] = [];
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    console.log(`📊 Fetching measurements from ${locations.length} locations with rate limiting...`);

    // Strategy: Use bulk measurements endpoint to reduce API calls
    // Instead of individual sensor calls, try location-based batched requests
    const maxLocationsPerRequest = 50; // Conservative batch size to stay within rate limits
    
    for (let i = 0; i < locations.length; i += maxLocationsPerRequest) {
      const locationBatch = locations.slice(i, i + maxLocationsPerRequest);
      const locationIds = locationBatch.map(loc => loc.id);

      try {
        console.log(`📡 Fetching measurements for batch ${Math.floor(i/maxLocationsPerRequest) + 1}/${Math.ceil(locations.length/maxLocationsPerRequest)} (${locationBatch.length} locations)`);
        
        // Use bulk measurements endpoint if available, otherwise fall back to individual calls
        const response = await this.makeRateLimitedRequest<OpenAQResponse<OpenAQMeasurement>>(
          `${this.baseUrl}/measurements`,
          {
            locations_id: locationIds.join(','),
            parameters_id: '2,7', // PM2.5 and NO2
            date_from: twoHoursAgo.toISOString(),
            date_to: now.toISOString(),
            limit: 10000, // Get as many as possible in one call
            sort: 'desc'
          }
        );

        const validMeasurements = response.results.filter(m => 
          m.value !== null && m.value !== undefined && m.value >= 0
        );

        // Enrich measurements with location data
        const enrichedMeasurements = validMeasurements.map(measurement => {
          const location = locationBatch.find(loc => loc.id === (measurement as any).location?.id);
          return {
            ...measurement,
            coordinates: location?.coordinates || measurement.coordinates,
            locationId: location?.id || (measurement as any).location?.id,
            countryCode: location?.country?.code || 'UNKNOWN'
          } as any;
        });

        measurements.push(...enrichedMeasurements);
        console.log(`✅ Retrieved ${enrichedMeasurements.length} measurements from batch`);

      } catch (bulkError: any) {
        // If bulk request fails, fall back to individual sensor requests with heavy rate limiting
        console.warn(`⚠️ Bulk request failed, falling back to individual sensor requests: ${bulkError.message}`);
        
        const fallbackMeasurements = await this.getFallbackMeasurements(locationBatch, twoHoursAgo, now);
        measurements.push(...fallbackMeasurements);
      }

      // Add extra delay between batches to be respectful to rate limits
      if (i + maxLocationsPerRequest < locations.length) {
        const delay = 2000; // 2 second delay between batches
        console.log(`⏳ Waiting ${delay/1000}s before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.log(`✅ Total measurements retrieved: ${measurements.length}`);
    return measurements;
  }

  /**
   * Fallback method for individual sensor requests with strict rate limiting
   */
  private async getFallbackMeasurements(
    locations: OpenAQLocation[], 
    dateFrom: Date, 
    dateTo: Date
  ): Promise<OpenAQMeasurement[]> {
    const measurements: OpenAQMeasurement[] = [];
    
    // Limit to first 20 locations to avoid rate limit issues
    const limitedLocations = locations.slice(0, 20);
    console.log(`⚠️ Using fallback mode for ${limitedLocations.length} locations (limited to avoid rate limits)`);

    for (const location of limitedLocations) {
      const relevantSensors = location.sensors.filter(sensor => 
        ['pm25', 'no2'].includes(sensor.parameter.name)
      ).slice(0, 2); // Limit to 2 sensors per location

      for (const sensor of relevantSensors) {
        try {
          console.log(`📊 Fetching sensor ${sensor.id} for location ${location.id}`);
          
          const response = await this.makeRateLimitedRequest<OpenAQResponse<OpenAQMeasurement>>(
            `${this.baseUrl}/sensors/${sensor.id}/hours`,
            {
              date_from: dateFrom.toISOString(),
              date_to: dateTo.toISOString(),
              limit: 100
            }
          );

          const validMeasurements = response.results.filter(m => 
            m.value !== null && m.value !== undefined && m.value >= 0
          );

          measurements.push(...validMeasurements.map(m => ({
            ...m,
            coordinates: location.coordinates,
            locationId: location.id,
            countryCode: location.country.code
          } as any)));

          // Rate limit status check
          const status = this.rateLimiter.getStatus();
          if (status.minuteUsage.remaining < 10) {
            console.log(`⚠️ Rate limit approaching (${status.minuteUsage.remaining} requests remaining), stopping fallback`);
            break;
          }

        } catch (sensorError: any) {
          console.warn(`⚠️ Failed to get measurements for sensor ${sensor.id}:`, sensorError.message);
        }
      }
    }

    return measurements;
  }

  /**
   * Convert OpenAQ v3 data format to standardized observation format
   */
  convertToObservations(measurements: OpenAQMeasurement[]): any[] {
    return measurements.map(measurement => {
      // Determine AQI band based on WHO guidelines
      let aqiBand = 'good';
      
      if (measurement.parameter.name === 'pm25') {
        if (measurement.value > 25) aqiBand = 'unhealthy';
        else if (measurement.value > 15) aqiBand = 'moderate';
      } else if (measurement.parameter.name === 'no2') {
        if (measurement.value > 40) aqiBand = 'unhealthy'; 
        else if (measurement.value > 25) aqiBand = 'moderate';
      }

      // Use the country code from the location data (already available from API)
      const countryCode = (measurement as any).countryCode || 'UNKNOWN';

      return {
        station_id: `openaq-${(measurement as any).locationId}`,
        pollutant: measurement.parameter.name,
        value: measurement.value,
        unit: measurement.parameter.units,
        aqi_band: aqiBand,
        observed_at: new Date(measurement.period.datetime_from.utc).toISOString(),
        lat: measurement.coordinates?.latitude || null,
        lon: measurement.coordinates?.longitude || null,
        country_code: countryCode,
        region_code: countryCode, // MVP: use country code as region
        source: 'OpenAQ',
        raw: measurement
      };
    });
  }
}