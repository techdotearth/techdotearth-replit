import axios from 'axios';

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

  constructor() {
    this.apiKey = process.env.OPENAQ_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ OPENAQ_API_KEY not set - OpenAQ requests will fail');
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
      const response = await axios.get<OpenAQResponse<OpenAQCountry>>(`${this.baseUrl}/countries`, {
        params: { limit: 300 },
        headers: {
          'X-API-Key': this.apiKey,
          'User-Agent': 'Environmental-Monitoring-System/1.0'
        },
        timeout: 15000
      });

      this.europeanCountryIds = response.data.results
        .filter(country => europeanCodes.includes(country.code))
        .map(country => country.id);
      
      console.log(`📍 Loaded ${this.europeanCountryIds.length} European country IDs from OpenAQ`);
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
      const response = await axios.get<OpenAQResponse<OpenAQLocation>>(`${this.baseUrl}/locations`, {
        params: {
          countries_id: this.europeanCountryIds.join(','),
          parameters_id: '2,7', // 2=PM2.5, 7=NO2 (based on OpenAQ parameter IDs)
          limit: 1000,
          monitor: true, // Only reference monitors
          mobile: false  // Exclude mobile stations
        },
        headers: {
          'X-API-Key': this.apiKey,
          'User-Agent': 'Environmental-Monitoring-System/1.0'
        },
        timeout: 20000
      });

      return response.data.results.filter(location => 
        location.coordinates?.latitude && 
        location.coordinates?.longitude &&
        location.sensors?.some(sensor => 
          ['pm25', 'no2'].includes(sensor.parameter.name)
        )
      );
    } catch (error: any) {
      console.error('❌ Failed to get European locations:', error.message);
      throw error;
    }
  }

  /**
   * Get recent hourly measurements from locations
   */
  private async getRecentMeasurements(locations: OpenAQLocation[]): Promise<OpenAQMeasurement[]> {
    const measurements: OpenAQMeasurement[] = [];
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours for buffer

    // Process locations in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < locations.length; i += batchSize) {
      const batch = locations.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (location) => {
        try {
          // Get relevant sensors (PM2.5 and NO2)
          const relevantSensors = location.sensors.filter(sensor => 
            ['pm25', 'no2'].includes(sensor.parameter.name)
          );

          for (const sensor of relevantSensors) {
            try {
              const response = await axios.get<OpenAQResponse<OpenAQMeasurement>>(
                `${this.baseUrl}/sensors/${sensor.id}/hours`, {
                params: {
                  date_from: twoHoursAgo.toISOString(),
                  date_to: now.toISOString(),
                  limit: 100
                },
                headers: {
                  'X-API-Key': this.apiKey,
                  'User-Agent': 'Environmental-Monitoring-System/1.0'
                },
                timeout: 10000
              });

              const validMeasurements = response.data.results.filter(m => 
                m.value !== null && m.value !== undefined && m.value >= 0
              );

              measurements.push(...validMeasurements.map(m => ({
                ...m,
                coordinates: location.coordinates,
                locationId: location.id,
                countryCode: location.country.code
              } as any)));

            } catch (sensorError: any) {
              console.warn(`⚠️ Failed to get measurements for sensor ${sensor.id}:`, sensorError.message);
            }
          }
        } catch (locationError: any) {
          console.warn(`⚠️ Failed to process location ${location.id}:`, locationError.message);
        }
      });

      await Promise.all(batchPromises);
      
      // Add delay between batches to be respectful to API
      if (i + batchSize < locations.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
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