import axios from 'axios';

interface EEAStation {
  AirQualityStation: string;
  AirQualityStationEoICode: string;
  Pollutant: string;
  AveragingTime: string;
  Concentration: number;
  UnitOfMeasurement: string;
  DatetimeBegin: string;
  DatetimeEnd: string;
  Validity: number;
  Verification: number;
  AirQualityNetwork: string;
  AirQualityStationArea: string;
  AirQualityStationNatCode: string;
  SamplingPoint: string;
  CountryCode: string;
}

interface EEAResponse {
  results: EEAStation[];
  count: number;
}

export class EEAClient {
  private readonly baseUrl = 'https://discomap.eea.europa.eu/map/fme/AirQualityExport.fmw';
  
  /**
   * Fetch hourly air quality data for PM2.5 and NO2 from EEA
   * Returns data for the last hour, European timezone normalized to UTC
   */
  async fetchHourlyData(): Promise<EEAStation[]> {
    try {
      console.log('🌍 Fetching hourly air quality data from EEA...');
      
      // Get current hour in UTC 
      const now = new Date();
      const currentHourUTC = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getUTCHours());
      const endTime = currentHourUTC.toISOString();
      const startTime = new Date(currentHourUTC.getTime() - 60 * 60 * 1000).toISOString(); // 1 hour ago
      
      const params = {
        CountryCode: '', // Empty = all EU countries
        CityName: '',
        Pollutant: '5,8', // 5=PM2.5, 8=NO2  
        Year_from: currentHourUTC.getFullYear(),
        Year_to: currentHourUTC.getFullYear(),
        Station: '',
        Samplingpoint: '',
        Source: 'E1a', // Verified hourly data
        Output: 'JSON',
        UpdateDate: '',
        TimeCoverage: 'Hour'
      };

      console.log(`📊 EEA API call: ${startTime} to ${endTime}`);
      
      const response = await axios.get<EEAResponse>(this.baseUrl, {
        params,
        timeout: 30000, // 30 second timeout
        headers: {
          'User-Agent': 'Environmental-Monitoring-System/1.0'
        }
      });

      if (!response.data?.results) {
        console.warn('⚠️ EEA response missing results array');
        return [];
      }

      // Filter for recent hourly data (last 2 hours to account for timezone/processing delays)
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const recentData = response.data.results.filter(station => {
        const stationTime = new Date(station.DatetimeBegin);
        return stationTime >= twoHoursAgo && 
               ['5', '8'].includes(station.Pollutant) && // PM2.5 or NO2
               station.Validity > 0; // Valid measurements only
      });

      console.log(`✅ EEA: Retrieved ${recentData.length} valid hourly observations`);
      return recentData;
      
    } catch (error: any) {
      console.error('❌ EEA API fetch failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      throw new Error(`EEA API error: ${error.message}`);
    }
  }

  /**
   * Convert EEA data format to standardized observation format
   */
  convertToObservations(stations: EEAStation[]): any[] {
    return stations.map(station => {
      // Map EEA pollutant codes to our format
      const pollutantMap: Record<string, string> = {
        '5': 'pm25',   // PM2.5 
        '8': 'no2'     // NO2
      };

      // Determine AQI band based on WHO guidelines
      let aqiBand = 'good';
      const pollutant = pollutantMap[station.Pollutant];
      
      if (pollutant === 'pm25') {
        if (station.Concentration > 25) aqiBand = 'unhealthy';
        else if (station.Concentration > 15) aqiBand = 'moderate';
      } else if (pollutant === 'no2') {
        if (station.Concentration > 40) aqiBand = 'unhealthy';
        else if (station.Concentration > 25) aqiBand = 'moderate';
      }

      return {
        station_id: station.AirQualityStationEoICode,
        pollutant: pollutant,
        value: station.Concentration,
        unit: station.UnitOfMeasurement,
        aqi_band: aqiBand,
        observed_at: new Date(station.DatetimeBegin).toISOString(),
        lat: null, // EEA doesn't provide coordinates in this endpoint
        lon: null,
        country_code: station.CountryCode,
        region_code: station.CountryCode, // MVP: use country code as region
        source: 'EEA',
        raw: station
      };
    });
  }
}