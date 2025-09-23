import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Admin API function initialized")

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const method = req.method
    const pathname = url.pathname

    // JWT-based admin authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Bearer token required' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const token = authHeader.slice(7)
    
    // Verify JWT token with Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('❌ Invalid JWT token:', authError?.message)
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Check if user has admin role
    const isAdmin = user.app_metadata?.role === 'admin' || 
                   user.user_metadata?.role === 'admin' ||
                   user.email?.endsWith('@admin.com') // Simple demo rule
    
    if (!isAdmin) {
      console.warn('⚠️ User lacks admin privileges:', user.email)
      return new Response(
        JSON.stringify({ error: 'Forbidden - admin access required' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Use authenticated user ID for audit trail
    const adminUserId = user.id

    // Route: POST /api/admin/override
    if (pathname === '/api/admin/override' && method === 'POST') {
      const body = await req.json()
      const { type, region_code, score, note } = body

      // Validation
      if (!type || !region_code || typeof score !== 'number') {
        return new Response(
          JSON.stringify({ error: 'type, region_code, score required' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      if (score < 0 || score > 100) {
        return new Response(
          JSON.stringify({ error: 'score must be between 0 and 100' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      const validTypes = ['air_quality', 'heat', 'floods', 'wildfire']
      if (!validTypes.includes(type)) {
        return new Response(
          JSON.stringify({ error: 'Invalid challenge type' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Insert admin override (assuming we have this table in schema)
      const { error } = await supabase.rpc('create_admin_override', {
        override_type: type,
        override_region_code: region_code,
        override_score: score,
        override_note: note,
        created_by_user: adminUserId
      })

      if (error) {
        console.error('Admin override error:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to create admin override' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Route: POST /api/admin/manual-score
    if (pathname === '/api/admin/manual-score' && method === 'POST') {
      const body = await req.json()
      const {
        type, region_code, score, freshness = 'today',
        intensity = null, exposure = null, persistence = null,
        inputs_json = null
      } = body

      // Validation
      if (!type || !region_code || typeof score !== 'number') {
        return new Response(
          JSON.stringify({ error: 'type, region_code, score required' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      if (score < 0 || score > 100) {
        return new Response(
          JSON.stringify({ error: 'score must be between 0 and 100' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      const validTypes = ['air_quality', 'heat', 'floods', 'wildfire']
      const validFreshness = ['live', 'today', 'week', 'stale']
      
      if (!validTypes.includes(type)) {
        return new Response(
          JSON.stringify({ error: 'Invalid challenge type' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      if (!validFreshness.includes(freshness)) {
        return new Response(
          JSON.stringify({ error: 'Invalid freshness value' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Insert manual score (assuming we have this table/function in schema)
      const { error } = await supabase.rpc('create_manual_score', {
        score_type: type,
        score_region_code: region_code,
        score_value: score,
        score_freshness: freshness,
        score_intensity: intensity,
        score_exposure: exposure,
        score_persistence: persistence,
        score_inputs_json: inputs_json,
        created_by_user: adminUserId
      })

      if (error) {
        console.error('Manual score error:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to create manual score' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Default: Route not found
    return new Response(JSON.stringify({ error: 'Route not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Admin function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})