import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Public API function initialized")

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const url = new URL(req.url)
    const method = req.method
    const pathname = url.pathname

    // Route: GET /api/leaderboard (all types)
    if (pathname === '/api/leaderboard' && method === 'GET') {
      const { data, error } = await supabase
        .from('v_leaderboard')
        .select('*')
        .order('display_score', { ascending: false })

      if (error) {
        console.error('Leaderboard error:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch leaderboard' }), 
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Route: GET /api/leaderboard/:type (specific type)
    if (pathname.startsWith('/api/leaderboard/') && method === 'GET') {
      const type = pathname.split('/')[3]
      
      const { data, error } = await supabase
        .from('v_leaderboard')
        .select('*')
        .eq('type', type)
        .order('display_score', { ascending: false })

      if (error) {
        console.error('Leaderboard type error:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch leaderboard for type' }), 
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Route: GET /api/challenge/:type/:region (challenge detail)
    if (pathname.startsWith('/api/challenge/') && method === 'GET') {
      const pathParts = pathname.split('/')
      if (pathParts.length >= 5) {
        const type = pathParts[3]
        const region = pathParts[4]

        const { data, error } = await supabase.rpc('challenge_detail', {
          challenge_type: type,
          region_name: region
        })

        if (error) {
          console.error('Challenge detail error:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch challenge detail' }), 
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        if (!data) {
          return new Response(
            JSON.stringify({ error: 'Challenge not found' }), 
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Route: GET /api/data-freshness (data freshness info)
    if (pathname === '/api/data-freshness' && method === 'GET') {
      const { data, error } = await supabase.rpc('last_fetch_times')

      if (error) {
        console.error('Data freshness error:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch data freshness' }), 
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Default: Route not found
    return new Response(JSON.stringify({ error: 'Route not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})