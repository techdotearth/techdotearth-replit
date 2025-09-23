import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Edge function URLs - these will be deployed to Supabase
const FUNCTIONS_BASE_URL = `${supabaseUrl}/functions/v1`

export const edgeFunctions = {
  publicApi: `${FUNCTIONS_BASE_URL}/public-api`,
  adminApi: `${FUNCTIONS_BASE_URL}/admin-api`, 
  ingestionApi: `${FUNCTIONS_BASE_URL}/ingestion-api`,
  airQualityIngestion: `${FUNCTIONS_BASE_URL}/air-quality-ingestion`
}