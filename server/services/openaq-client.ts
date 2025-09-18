import axios from 'axios';

interface OpenAQMeasurement {
  locationId: number;
  location: string;
  parameter: string;
  value: number;
  unit: string;
  country: string;
  city: string;
  isMobile: boolean;
  isAnalysis: boolean;
  entity: string;
  sensorType: string;
  date: {
    utc: string;
    local: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface OpenAQResponse {
  meta: {
    name: string;
    license: string;
    website: string;
    page: number;
    limit: number;
    found: number;
  };
  results: OpenAQMeasurement[];
}

export class OpenAQClient {
  private readonly baseUrl = 'https://api.openaq.org/v2';
  
  /**
   * Fetch hourly air quality data for PM2.5 and NO2 from OpenAQ
   * Returns data for the last hour from European stations
   */
  async fetchHourlyData(): Promise<OpenAQMeasurement[]> {
    try {
      console.log('🌐 Fetching hourly air quality data from OpenAQ...');
      
      // Get current hour in UTC
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const params = {
        parameter: 'pm25,no2',
        country: 'AT,BE,BG,HR,CY,CZ,DK,EE,FI,FR,DE,GR,HU,IE,IT,LV,LT,LU,MT,NL,PL,PT,RO,SK,SI,ES,SE,GB,NO,CH', // European countries
        date_from: oneHourAgo.toISOString(),
        date_to: now.toISOString(),
        limit: 10000, // Maximum allowed
        page: 1,
        offset: 0,
        sort: 'desc',
        radius: 1000000, // Large radius to capture European data
        order_by: 'datetime'
      };

      console.log(`📊 OpenAQ API call: ${oneHourAgo.toISOString()} to ${now.toISOString()}`);
      
      const response = await axios.get<OpenAQResponse>(`${this.baseUrl}/measurements`, {
        params,
        timeout: 30000, // 30 second timeout
        headers: {
          'User-Agent': 'Environmental-Monitoring-System/1.0'
        }
      });

      if (!response.data?.results) {
        console.warn('⚠️ OpenAQ response missing results array');
        return [];
      }

      // Filter for valid measurements with coordinates
      const validData = response.data.results.filter(measurement => 
        measurement.value !== null && 
        measurement.value !== undefined &&
        measurement.coordinates?.latitude &&
        measurement.coordinates?.longitude &&
        ['pm25', 'no2'].includes(measurement.parameter) &&
        !measurement.isMobile // Exclude mobile measurements for consistency
      );

      console.log(`✅ OpenAQ: Retrieved ${validData.length} valid hourly observations`);
      return validData;
      
    } catch (error: any) {
      console.error('❌ OpenAQ API fetch failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      throw new Error(`OpenAQ API error: ${error.message}`);
    }
  }

  /**
   * Convert OpenAQ data format to standardized observation format
   */
  convertToObservations(measurements: OpenAQMeasurement[]): any[] {
    return measurements.map(measurement => {
      // Determine AQI band based on WHO guidelines
      let aqiBand = 'good';
      
      if (measurement.parameter === 'pm25') {
        if (measurement.value > 25) aqiBand = 'unhealthy';
        else if (measurement.value > 15) aqiBand = 'moderate';
      } else if (measurement.parameter === 'no2') {
        if (measurement.value > 40) aqiBand = 'unhealthy'; 
        else if (measurement.value > 25) aqiBand = 'moderate';
      }

      // Map country names to ISO codes (simplified mapping for MVP)
      const countryCodeMap: Record<string, string> = {
        'Austria': 'AT', 'Belgium': 'BE', 'Bulgaria': 'BG', 'Croatia': 'HR',
        'Cyprus': 'CY', 'Czech Republic': 'CZ', 'Denmark': 'DK', 'Estonia': 'EE',
        'Finland': 'FI', 'France': 'FR', 'Germany': 'DE', 'Greece': 'GR',
        'Hungary': 'HU', 'Ireland': 'IE', 'Italy': 'IT', 'Latvia': 'LV',
        'Lithuania': 'LT', 'Luxembourg': 'LU', 'Malta': 'MT', 'Netherlands': 'NL',
        'Poland': 'PL', 'Portugal': 'PT', 'Romania': 'RO', 'Slovakia': 'SK',
        'Slovenia': 'SI', 'Spain': 'ES', 'Sweden': 'SE', 'United Kingdom': 'GB',
        'Norway': 'NO', 'Switzerland': 'CH'
      };

      const countryCode = countryCodeMap[measurement.country] || measurement.country?.substring(0, 2)?.toUpperCase();

      return {
        station_id: `openaq-${measurement.locationId}`,
        pollutant: measurement.parameter,
        value: measurement.value,
        unit: measurement.unit,
        aqi_band: aqiBand,
        observed_at: new Date(measurement.date.utc).toISOString(),
        lat: measurement.coordinates.latitude,
        lon: measurement.coordinates.longitude,
        country_code: countryCode,
        region_code: countryCode, // MVP: use country code as region
        source: 'OpenAQ',
        raw: measurement
      };
    });
  }
}