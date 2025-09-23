import { createClient } from 'jsr:@supabase/supabase-js@2'

console.log("Air Quality Ingestion function initialized")

// Simplified OpenAQ client for Deno environment
class OpenAQClient {
  private apiKey: string
  private rateLimiter: any

  constructor() {
    this.apiKey = Deno.env.get('OPENAQ_API_KEY') || ''
    // Simplified rate limiting for demo
    this.rateLimiter = {
      canMakeRequest: () => true,
      recordRequest: () => {}
    }
  }

  async fetchHourlyData(): Promise<any[]> {
    try {
      // Get recent hourly measurements for PM2.5 and NO2
      const response = await fetch(
        `https://api.openaq.org/v3/measurements?` + new URLSearchParams({
          'parameters_id': '2,5', // PM2.5 and NO2
          'date_from': new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          'date_to': new Date().toISOString(),
          'limit': '1000'
        }), {
          headers: {
            'X-API-Key': this.apiKey
          }
        }
      )

      if (!response.ok) {
        throw new Error(`OpenAQ API error: ${response.status}`)
      }

      const data = await response.json()
      return data.results || []
    } catch (error) {
      console.error('OpenAQ fetch error:', error)
      return []
    }
  }

  convertToObservations(data: any[]): any[] {
    return data.map(item => ({
      stationId: `openaq-${item.locationId}`,
      pollutant: item.parameter?.name === 'pm2.5' ? 'pm25' : item.parameter?.name,
      value: item.value,
      unit: item.parameter?.units || 'µg/m³',
      aqiBand: this.calculateAQI(item.parameter?.name, item.value),
      observedAt: new Date(item.period?.datetimeFrom?.utc || item.datetime?.utc),
      lat: item.coordinates?.latitude,
      lon: item.coordinates?.longitude,
      countryCode: item.countryCode,
      regionCode: item.countryCode,
      source: 'OpenAQ',
      raw: item
    })).filter(obs => obs.pollutant && obs.value && obs.observedAt)
  }

  private calculateAQI(pollutant: string, value: number): string {
    if (pollutant === 'pm2.5') {
      if (value <= 12) return 'good'
      if (value <= 35.4) return 'moderate'
      if (value <= 55.4) return 'unhealthy_for_sensitive'
      if (value <= 150.4) return 'unhealthy'
      if (value <= 250.4) return 'very_unhealthy'
      return 'hazardous'
    } else if (pollutant === 'no2') {
      if (value <= 40) return 'good'
      if (value <= 80) return 'moderate'
      return 'unhealthy'
    }
    return 'moderate'
  }
}

Deno.serve(async (req) => {
  try {
    console.log('🔄 Starting air quality data ingestion...')
    
    // Initialize Supabase client with service role for data ingestion
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const openaq = new OpenAQClient()
    let totalInserted = 0

    // Fetch data from OpenAQ
    console.log('📡 Fetching from OpenAQ...')
    const openaqData = await openaq.fetchHourlyData()
    const observations = openaq.convertToObservations(openaqData)
    
    console.log(`✅ OpenAQ: ${observations.length} observations fetched`)

    if (observations.length > 0) {
      // Deduplicate by stationId, pollutant, observedAt
      const deduped = new Map()
      observations.forEach(obs => {
        const key = `${obs.stationId}|${obs.pollutant}|${obs.observedAt.toISOString()}`
        if (!deduped.has(key)) {
          deduped.set(key, obs)
        }
      })

      const uniqueObservations = Array.from(deduped.values())
      console.log(`🔄 After deduplication: ${uniqueObservations.length} observations`)

      // Bulk insert in batches to avoid edge function limits
      const batchSize = 100
      for (let i = 0; i < uniqueObservations.length; i += batchSize) {
        const batch = uniqueObservations.slice(i, i + batchSize)
        
        const { error } = await supabase
          .from('aq_observations')
          .upsert(batch.map(obs => ({
            station_id: obs.stationId,
            pollutant: obs.pollutant,
            value: obs.value,
            unit: obs.unit,
            aqi_band: obs.aqiBand,
            observed_at: obs.observedAt.toISOString(),
            lat: obs.lat,
            lon: obs.lon,
            country_code: obs.countryCode,
            region_code: obs.regionCode,
            source: obs.source,
            raw: obs.raw
          })), {
            onConflict: 'station_id,pollutant,observed_at',
            ignoreDuplicates: true
          })

        if (error) {
          console.error(`❌ Batch insert error:`, error)
        } else {
          totalInserted += batch.length
          console.log(`✅ Inserted batch of ${batch.length} observations`)
        }
      }
    }

    console.log(`🎉 Air quality ingestion completed. Total inserted: ${totalInserted}`)

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully ingested ${totalInserted} air quality observations`,
      timestamp: new Date().toISOString(),
      source: 'OpenAQ',
      total_observations: totalInserted
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Air quality ingestion failed:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Air quality ingestion failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})