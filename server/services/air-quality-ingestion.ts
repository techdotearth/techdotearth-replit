import { EEAClient } from './eea-client.js';
import { OpenAQClient } from './openaq-client.js';
import { storage } from '../storage.js';

interface AQObservation {
  station_id: string;
  pollutant: string;
  value: number;
  unit: string;
  aqi_band: string;
  observed_at: string;
  lat?: number;
  lon?: number;
  country_code: string;
  region_code: string;
  source: string;
  raw: any;
}

export class AirQualityIngestionService {
  private readonly eea = new EEAClient();
  private readonly openaq = new OpenAQClient();

  /**
   * Main ingestion orchestrator - fetches from EEA (primary) and OpenAQ (fallback)
   * Handles deduplication, UTC normalization, and persistence
   */
  async ingestHourlyData(): Promise<void> {
    console.log('🔄 Starting hourly air quality data ingestion...');
    const startTime = Date.now();
    
    let allObservations: AQObservation[] = [];
    let sourceStats = { eea: 0, openaq: 0, failed: [] as string[] };

    try {
      // 1. Primary source: EEA
      try {
        console.log('📡 Fetching from EEA (primary source)...');
        const eeaData = await this.eea.fetchHourlyData();
        const eeaObservations = this.eea.convertToObservations(eeaData);
        allObservations.push(...eeaObservations);
        sourceStats.eea = eeaObservations.length;
        console.log(`✅ EEA: ${eeaObservations.length} observations fetched`);
      } catch (eeaError: any) {
        console.error('⚠️ EEA fetch failed, will try OpenAQ fallback:', eeaError.message);
        sourceStats.failed.push(`EEA: ${eeaError.message}`);
      }

      // 2. Fallback source: OpenAQ (only if EEA failed or returned insufficient data)
      if (sourceStats.eea < 100) { // Threshold for "insufficient data"
        try {
          console.log('📡 Fetching from OpenAQ (fallback source)...');
          const openaqData = await this.openaq.fetchHourlyData();
          const openaqObservations = this.openaq.convertToObservations(openaqData);
          allObservations.push(...openaqObservations);
          sourceStats.openaq = openaqObservations.length;
          console.log(`✅ OpenAQ: ${openaqObservations.length} observations fetched`);
        } catch (openaqError: any) {
          console.error('❌ OpenAQ fetch also failed:', openaqError.message);
          sourceStats.failed.push(`OpenAQ: ${openaqError.message}`);
        }
      }

      // 3. Deduplication and normalization
      const dedupedObservations = this.deduplicateObservations(allObservations);
      const normalizedObservations = this.normalizeObservations(dedupedObservations);
      
      console.log(`📊 Processing summary:`);
      console.log(`  - Raw observations: ${allObservations.length}`);
      console.log(`  - After deduplication: ${dedupedObservations.length}`);
      console.log(`  - Final normalized: ${normalizedObservations.length}`);

      // 4. Persist to database via ingestion API
      if (normalizedObservations.length > 0) {
        await this.persistObservations(normalizedObservations);
        console.log(`✅ Successfully ingested ${normalizedObservations.length} air quality observations`);
      } else {
        console.warn('⚠️ No valid observations to persist');
      }

    } catch (error: any) {
      console.error('❌ Ingestion failed:', error.message);
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      console.log(`⏱️ Ingestion completed in ${duration}ms`);
      console.log(`📈 Source stats:`, sourceStats);
    }
  }

  /**
   * Remove duplicate observations based on station_id, pollutant, and observed_at
   */
  private deduplicateObservations(observations: AQObservation[]): AQObservation[] {
    const seen = new Set<string>();
    const deduped: AQObservation[] = [];

    for (const obs of observations) {
      // Create deduplication key
      const key = `${obs.station_id}|${obs.pollutant}|${obs.observed_at}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(obs);
      }
    }

    console.log(`🔄 Deduplication: ${observations.length} → ${deduped.length} observations`);
    return deduped;
  }

  /**
   * Normalize observations for consistent storage
   * - Ensure UTC timestamps
   * - Validate required fields
   * - Map regions to country codes (MVP level)
   */
  private normalizeObservations(observations: AQObservation[]): AQObservation[] {
    const normalized: AQObservation[] = [];

    for (const obs of observations) {
      try {
        // Ensure UTC timestamp
        const observedDate = new Date(obs.observed_at);
        if (isNaN(observedDate.getTime())) {
          console.warn(`⚠️ Invalid timestamp for observation: ${obs.observed_at}`);
          continue;
        }

        // Validate required fields
        if (!obs.station_id || !obs.pollutant || typeof obs.value !== 'number') {
          console.warn(`⚠️ Missing required fields in observation:`, {
            station_id: obs.station_id,
            pollutant: obs.pollutant,
            value: obs.value
          });
          continue;
        }

        // Ensure region mapping (MVP: country-level only)
        const regionCode = this.mapStationToRegion(obs.station_id, obs.country_code);

        normalized.push({
          ...obs,
          observed_at: observedDate.toISOString(), // Ensure UTC ISO format
          region_code: regionCode,
          value: Math.round(obs.value * 1000) / 1000 // Round to 3 decimal places
        });

      } catch (error: any) {
        console.warn(`⚠️ Failed to normalize observation:`, error.message, obs);
        continue;
      }
    }

    return normalized;
  }

  /**
   * Map measurement stations to region codes
   * MVP implementation: use country codes as region codes
   */
  private mapStationToRegion(stationId: string, countryCode: string): string {
    // MVP: Simply use country code as region code
    // Future enhancement: could map to sub-regions based on station location
    return countryCode || 'UNKNOWN';
  }

  /**
   * Persist observations directly to database
   */
  private async persistObservations(observations: AQObservation[]): Promise<void> {
    try {
      console.log(`💾 Persisting ${observations.length} observations to database...`);
      
      // Convert observations to database format
      const dbObservations = observations.map(obs => ({
        station_id: obs.station_id,
        pollutant: obs.pollutant,
        value: obs.value,
        unit: obs.unit,
        aqi_band: obs.aqi_band as 'good' | 'moderate' | 'unhealthy',
        observed_at: new Date(obs.observed_at),
        lat: obs.lat,
        lon: obs.lon,
        country_code: obs.country_code,
        region_code: obs.region_code,
        source: obs.source,
        raw: obs.raw
      }));

      // Insert observations into database
      const result = await storage.insertAirQualityObservations(dbObservations);
      console.log(`✅ Successfully persisted ${result.inserted} observations`);

    } catch (error: any) {
      console.error('❌ Failed to persist observations:', error.message);
      throw error;
    }
  }
}