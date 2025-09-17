import express from 'express';
import cors from 'cors';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to handle async routes
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ===== PUBLIC ENDPOINTS =====

// Get leaderboard data (all types)
app.get('/api/leaderboard', asyncHandler(async (req: express.Request, res: express.Response) => {
  const result = await db.execute(sql`SELECT * FROM v_leaderboard ORDER BY display_score DESC`);
  res.json(result.rows);
}));

// Get leaderboard data (specific type)
app.get('/api/leaderboard/:type', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { type } = req.params;
  const result = await db.execute(sql`SELECT * FROM v_leaderboard WHERE type = ${type}::challenge_type ORDER BY display_score DESC`);
  res.json(result.rows);
}));

// Get challenge detail
app.get('/api/challenge/:type/:region', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { type, region } = req.params;
  
  const result = await db.execute(
    sql`SELECT challenge_detail(${type}::challenge_type, ${region})`
  );
  
  const challengeData = result.rows[0]?.challenge_detail;
  if (!challengeData) {
    return res.status(404).json({ error: 'Challenge not found' });
  }
  
  res.json(challengeData);
}));

// Get data freshness/last fetch times
app.get('/api/data-freshness', asyncHandler(async (req: express.Request, res: express.Response) => {
  const result = await db.execute(sql`SELECT * FROM last_fetch_times()`);
  res.json(result.rows);
}));

// ===== ADMIN ENDPOINTS =====

// Simple auth middleware (basic token check for demo)
const requireAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer admin-token') {
    return res.status(401).json({ error: 'Unauthorized - admin token required' });
  }
  req.userId = '11111111-1111-1111-1111-111111111111'; // Admin user ID
  next();
};

// Create admin override
app.post('/api/admin/override', requireAuth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const { type, region_code, score, note } = req.body;
  
  if (!type || !region_code || typeof score !== 'number') {
    return res.status(400).json({ error: 'type, region_code, score required' });
  }
  
  if (score < 0 || score > 100) {
    return res.status(400).json({ error: 'score must be between 0 and 100' });
  }
  
  // Validate challenge type
  const validTypes = ['air_quality', 'heat', 'floods', 'wildfire'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid challenge type' });
  }
  
  const userId = (req as any).userId;
  
  await db.execute(sql`
    INSERT INTO admin_override (type, region_code, score, note, created_by, active)
    VALUES (${type}::challenge_type, ${region_code}, ${score}, ${note}, ${userId}::uuid, true)
  `);
  
  res.json({ ok: true });
}));

// Create manual score  
app.post('/api/admin/manual-score', requireAuth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const {
    type, region_code, score, freshness = 'today',
    intensity = null, exposure = null, persistence = null,
    inputs_json = null
  } = req.body;
  
  if (!type || !region_code || typeof score !== 'number') {
    return res.status(400).json({ error: 'type, region_code, score required' });
  }
  
  if (score < 0 || score > 100) {
    return res.status(400).json({ error: 'score must be between 0 and 100' });
  }
  
  // Validate challenge type and freshness
  const validTypes = ['air_quality', 'heat', 'floods', 'wildfire'];
  const validFreshness = ['live', 'today', 'week', 'stale'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid challenge type' });
  }
  if (!validFreshness.includes(freshness)) {
    return res.status(400).json({ error: 'Invalid freshness value' });
  }
  
  const userId = (req as any).userId;
  
  await db.execute(sql`
    INSERT INTO manual_score (type, region_code, score, freshness, intensity, exposure, persistence, inputs_json, created_by)
    VALUES (${type}::challenge_type, ${region_code}, ${score}, ${freshness}::freshness, ${intensity}, ${exposure}, ${persistence}, ${inputs_json}::jsonb, ${userId}::uuid)
  `);
  
  res.json({ ok: true });
}));

// ===== DATA INGESTION ENDPOINTS =====

// Air Quality Ingestion
app.post('/api/ingest/air-quality', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { observations } = req.body;
  
  if (!Array.isArray(observations) || observations.length === 0) {
    return res.status(400).json({ error: 'observations array required' });
  }
  
  // Validate and insert air quality observations
  const validObservations = observations.filter(obs => 
    obs.pollutant && ['pm25', 'no2'].includes(obs.pollutant) &&
    typeof obs.value === 'number' && obs.observed_at
  );
  
  if (validObservations.length === 0) {
    return res.status(400).json({ error: 'No valid observations found' });
  }
  
  // Batch insert observations
  for (const obs of validObservations) {
    await db.execute(sql`
      INSERT INTO aq_observation (
        station_id, pollutant, value, unit, aqi_band, observed_at,
        lat, lon, country_code, region_code, source, raw
      ) VALUES (
        ${obs.station_id || null},
        ${obs.pollutant}::text,
        ${obs.value}::numeric,
        ${obs.unit || null},
        ${obs.aqi_band || null},
        ${new Date(obs.observed_at)}::timestamptz,
        ${obs.lat || null}::double precision,
        ${obs.lon || null}::double precision,
        ${obs.country_code || null},
        ${obs.region_code || obs.country_code || null},
        ${obs.source || 'api'}::text,
        ${JSON.stringify(obs)}::jsonb
      )
    `);
  }
  
  console.log(`✅ Inserted ${validObservations.length} air quality observations`);
  res.json({ ok: true, inserted: validObservations.length });
}));

// Meteoalarm Ingestion  
app.post('/api/ingest/meteoalarm', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { alerts } = req.body;
  
  if (!Array.isArray(alerts) || alerts.length === 0) {
    return res.status(400).json({ error: 'alerts array required' });
  }
  
  // Validate and insert heat alerts
  const validAlerts = alerts.filter(alert => 
    alert.type === 'heat' && alert.region_code
  );
  
  if (validAlerts.length === 0) {
    return res.status(400).json({ error: 'No valid heat alerts found' });
  }
  
  // Batch insert alerts
  for (const alert of validAlerts) {
    await db.execute(sql`
      INSERT INTO alert_event (
        type, source, source_native_id, region_code, severity,
        properties, onset, expires, updated_at
      ) VALUES (
        'heat'::challenge_type,
        'meteoalarm'::text,
        ${alert.source_native_id || null},
        ${alert.region_code},
        ${alert.severity || null},
        ${JSON.stringify(alert)}::jsonb,
        ${alert.onset ? new Date(alert.onset) : null}::timestamptz,
        ${alert.expires ? new Date(alert.expires) : null}::timestamptz,
        NOW()
      )
    `);
  }
  
  console.log(`✅ Inserted ${validAlerts.length} meteoalarm heat alerts`);
  res.json({ ok: true, inserted: validAlerts.length });
}));

// Scoring endpoint
app.post('/api/compute-scores', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { types = ['air_quality', 'heat', 'floods', 'wildfire'], days = 1 } = req.body;
  
  console.log(`🧮 Computing scores for types: ${types.join(', ')}, days: ${days}`);
  
  const computedScores = [];
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  for (const type of types) {
    if (!['air_quality', 'heat', 'floods', 'wildfire'].includes(type)) {
      continue;
    }
    
    // Get enabled regions
    const regionsResult = await db.execute(sql`
      SELECT code FROM region WHERE is_enabled = true
    `);
    
    for (const region of regionsResult.rows) {
      const regionCode = region.code;
      
      try {
        let intensity = 0, exposure = 0, persistence = 0;
        let windowHours = 24; // Default window
        
        if (type === 'air_quality') {
          windowHours = 168; // 7 days for air quality
          // Compute air quality score from observations
          const aqResult = await db.execute(sql`
            SELECT AVG(value) as avg_value, COUNT(*) as count
            FROM aq_observation 
            WHERE region_code = ${regionCode} 
            AND observed_at >= NOW() - INTERVAL '168 hours'
            AND pollutant IN ('pm25', 'no2')
          `);
          
          if (aqResult.rows[0]?.count > 0) {
            const row = aqResult.rows[0] as any;
            const avgValue = parseFloat(row.avg_value || '0');
            const count = parseInt(row.count || '0');
            intensity = Math.min(1.0, avgValue / 50); // Normalize against WHO guideline
            exposure = Math.min(1.0, avgValue / 75); // Population exposure estimate
            persistence = Math.min(1.0, count / 24); // Data availability
          }
          
        } else if (type === 'heat') {
          windowHours = 24; // 24 hours for heat
          // Compute heat score from alerts
          const heatResult = await db.execute(sql`
            SELECT COUNT(*) as alert_count, 
                   COUNT(CASE WHEN severity IN ('orange', 'red') THEN 1 END) as severe_count
            FROM alert_event 
            WHERE region_code = ${regionCode} 
            AND type = 'heat'
            AND updated_at >= NOW() - INTERVAL '24 hours'
          `);
          
          const heatRow = heatResult.rows[0] as any;
          const alertCount = parseInt(heatRow?.alert_count || '0');
          const severeCount = parseInt(heatRow?.severe_count || '0');
          
          intensity = Math.min(1.0, severeCount / 5); // Normalize against max expected alerts
          exposure = Math.min(1.0, alertCount / 10);
          persistence = Math.min(1.0, alertCount / 3); // How long alerts persist
          
        } else if (type === 'floods') {
          windowHours = 48; // 48 hours for floods
          // Compute flood score from alerts  
          const floodResult = await db.execute(sql`
            SELECT COUNT(*) as alert_count
            FROM alert_event 
            WHERE region_code = ${regionCode} 
            AND type = 'floods'
            AND updated_at >= NOW() - INTERVAL '48 hours'
          `);
          
          const floodRow = floodResult.rows[0] as any;
          const alertCount = parseInt(floodRow?.alert_count || '0');
          intensity = Math.min(1.0, alertCount / 8);
          exposure = Math.min(1.0, alertCount / 12);
          persistence = Math.min(1.0, alertCount / 5);
          
        } else if (type === 'wildfire') {
          windowHours = 72; // 72 hours for wildfire
          // Compute wildfire score from alerts
          const fireResult = await db.execute(sql`
            SELECT COUNT(*) as alert_count
            FROM alert_event 
            WHERE region_code = ${regionCode} 
            AND type = 'wildfire'
            AND updated_at >= NOW() - INTERVAL '72 hours'
          `);
          
          const fireRow = fireResult.rows[0] as any;
          const alertCount = parseInt(fireRow?.alert_count || '0');
          intensity = Math.min(1.0, alertCount / 15);
          exposure = Math.min(1.0, alertCount / 20);
          persistence = Math.min(1.0, alertCount / 8);
        }
        
        // Calculate composite score (0-100)
        const score = Math.round(100 * (0.6 * intensity + 0.3 * exposure + 0.1 * persistence));
        
        // Determine freshness
        const freshness = windowHours <= 24 ? 'today' : windowHours <= 72 ? 'week' : 'stale';
        
        // Insert computed score
        await db.execute(sql`
          INSERT INTO challenge_score_day (
            type, region_code, date, window_hours, intensity, exposure, persistence, 
            score, freshness, inputs_json, as_of
          ) VALUES (
            ${type}::challenge_type, ${regionCode}, ${today}::date, ${windowHours},
            ${intensity}, ${exposure}, ${persistence}, ${score}, ${freshness}::freshness,
            ${JSON.stringify({ computed: true, window_hours: windowHours, algorithm: 'v1' })}::jsonb,
            NOW()
          )
          ON CONFLICT (type, region_code, date) 
          DO UPDATE SET 
            window_hours = EXCLUDED.window_hours,
            intensity = EXCLUDED.intensity,
            exposure = EXCLUDED.exposure, 
            persistence = EXCLUDED.persistence,
            score = EXCLUDED.score,
            freshness = EXCLUDED.freshness,
            inputs_json = EXCLUDED.inputs_json,
            as_of = EXCLUDED.as_of
        `);
        
        computedScores.push({ type, region_code: regionCode, score, intensity, exposure, persistence });
        
      } catch (error) {
        console.error(`❌ Error computing score for ${type}/${regionCode}:`, error);
      }
    }
  }
  
  console.log(`✅ Computed ${computedScores.length} scores`);
  res.json({ 
    ok: true, 
    computed: computedScores.length, 
    types, 
    days,
    scores: computedScores 
  });
}));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

export default app;