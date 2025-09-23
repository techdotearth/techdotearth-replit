// API service functions for connecting frontend to Supabase Edge Functions
import { ChallengeType } from '../App';
import { supabase, edgeFunctions } from './supabase';

// Base URL for direct edge function calls (fallback)
const getApiBaseUrl = () => {
  // For now, keep the Express backend as fallback during migration
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:3001`;
  }
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

// Challenge interface matching backend data structure
export interface Challenge {
  id: string;
  type: ChallengeType;
  regionName: string;
  regionCode: string;  // Backend region identifier
  countryCode: string; // Backend country identifier
  score: number;
  freshness: 'live' | 'today' | 'week' | 'stale';
  intensity: number;
  exposure?: number;
  persistence?: number;
  peopleExposed: number;
  exposureTrend: 'up' | 'down' | 'flat';
  updatedIso: string;
  sources: ('EEA' | 'Meteoalarm' | 'EA' | 'GloFAS' | 'FIRMS' | 'GHSL')[];
  hasOverride: boolean;
  overrideNote?: string;
  rank?: number;
}

// Backend API response interfaces
interface LeaderboardItem {
  type: string;
  region_code: string;
  region_name: string;
  country_code: string;
  audience: string;
  display_score: string;
  intensity: string;
  exposure?: string;
  persistence?: string;
  freshness: string;
  inputs_json: any;
  as_of: string;
  override_note?: string;
}

type LeaderboardResponse = LeaderboardItem[];

interface ChallengeDetailResponse {
  type: string;
  region_code: string;
  region_name: string;
  country_code: string;
  audience: string;
  display_score: number;
  intensity: number;
  exposure: number;
  persistence: number;
  freshness: string;
  inputs_json: any;
  as_of: string;
  override_note?: string;
}

// Utility functions
const fetchApi = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`🌐 API Call: ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ API Error for ${endpoint}:`, error);
    throw error;
  }
};

// Convert Supabase response to frontend Challenge format
const convertSupabaseToChallenge = (items: any[], type: ChallengeType): Challenge[] => {
  return items.map((item, index) => {
    const sourceMap: Record<ChallengeType, Challenge['sources']> = {
      'air-quality': ['EEA', 'GHSL'],
      'heat': ['Meteoalarm', 'GHSL'],
      'floods': ['EA', 'GloFAS', 'GHSL'],
      'wildfire': ['FIRMS', 'GHSL']
    };

    const exposureTrend: 'up' | 'down' | 'flat' = 
      item.intensity > 0.7 ? 'up' : 
      item.intensity < 0.3 ? 'down' : 'flat';

    return {
      id: `${type}-${item.region_name}`,
      type,
      regionName: item.region_name,
      regionCode: item.region_name, // Use region_name as the code since that's what our DB uses
      countryCode: item.country_code,
      score: parseInt(item.display_score || item.score),
      freshness: item.freshness as Challenge['freshness'],
      intensity: parseFloat(item.intensity || '0'),
      exposure: item.peopleexposed ? parseFloat(item.peopleexposed) : undefined,
      persistence: item.persistence ? parseFloat(item.persistence) : undefined,
      peopleExposed: item.peopleexposed || 0, // Fixed field mapping
      exposureTrend,
      updatedIso: item.updated_at || item.created_at || new Date().toISOString(),
      sources: sourceMap[type],
      hasOverride: false,
      rank: index + 1
    };
  });
};

// Convert backend leaderboard response to frontend Challenge format
const convertToChallenge = (item: LeaderboardItem, rank: number): Challenge => {
  // Map backend challenge types to frontend types
  const typeMap: Record<string, ChallengeType> = {
    'air_quality': 'air-quality',
    'heat': 'heat',
    'floods': 'floods',
    'wildfire': 'wildfire'
  };

  const type = typeMap[item.type] || item.type as ChallengeType;
  const score = parseInt(item.display_score);
  const intensity = parseFloat(item.intensity);
  const exposure = item.exposure ? parseFloat(item.exposure) : undefined;
  const persistence = item.persistence ? parseFloat(item.persistence) : undefined;
  
  // Use actual people exposed from backend, fallback to 0 if not available
  const peopleExposed = item.inputs_json?.people || 0;
  
  // Determine exposure trend based on intensity
  const exposureTrend: 'up' | 'down' | 'flat' = 
    intensity > 0.7 ? 'up' : 
    intensity < 0.3 ? 'down' : 'flat';

  // Map sources based on challenge type (use backend sources when available)
  const sourceMap: Record<ChallengeType, Challenge['sources']> = {
    'air-quality': ['EEA', 'GHSL'],
    'heat': ['Meteoalarm', 'GHSL'],
    'floods': ['EA', 'GloFAS', 'GHSL'],
    'wildfire': ['FIRMS', 'GHSL']
  };

  return {
    id: `${type}-${item.region_code}`,
    type,
    regionName: item.region_name,
    regionCode: item.region_code,
    countryCode: item.country_code,
    score,
    freshness: item.freshness as Challenge['freshness'],
    intensity,
    exposure,
    persistence,
    peopleExposed,
    exposureTrend,
    updatedIso: item.as_of,
    sources: sourceMap[type],
    hasOverride: !!item.override_note,
    overrideNote: item.override_note || undefined,
    rank
  };
};

// Get leaderboard data for a specific challenge type using Supabase
export const getChallenges = async (type: ChallengeType): Promise<Challenge[]> => {
  try {
    console.log(`🔄 Fetching challenges for ${type}`);
    
    const typeMap: Record<ChallengeType, string> = {
      'air-quality': 'air_quality',
      'heat': 'heat',
      'floods': 'floods',
      'wildfire': 'wildfire'
    };

    const backendType = typeMap[type];
    
    // Try Supabase direct query first
    const { data, error } = await supabase
      .from('v_leaderboard')
      .select('*')
      .eq('type', backendType)
      .order('display_score', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      // Fallback to edge function
      const response = await fetch(`${edgeFunctions.publicApi}/api/leaderboard/${backendType}`);
      if (!response.ok) {
        throw new Error(`Edge function error: ${response.status}`);
      }
      const fallbackData = await response.json();
      return convertSupabaseToChallenge(fallbackData || [], type);
    }

    console.log(`✅ Loaded ${data?.length || 0} challenges for ${type}`);
    return convertSupabaseToChallenge(data || [], type);
    
  } catch (error) {
    console.error(`❌ Failed to fetch challenges for ${type}:`, error);
    // Return empty array on error to prevent UI crashes
    return [];
  }
};

// Get detailed information for a specific challenge using Supabase RPC
export const getChallengeDetail = async (type: ChallengeType, regionCode: string): Promise<Challenge | null> => {
  try {
    const typeMap: Record<ChallengeType, string> = {
      'air-quality': 'air_quality',
      'heat': 'heat',
      'floods': 'floods',
      'wildfire': 'wildfire'
    };

    const backendType = typeMap[type];
    
    // Try Supabase RPC function first
    const { data, error } = await supabase.rpc('challenge_detail', {
      challenge_type: backendType,
      region_name: regionCode
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      // Fallback to edge function
      const response = await fetch(`${edgeFunctions.publicApi}/api/challenge/${backendType}/${regionCode}`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    }

    if (!data) {
      return null;
    }

    // Convert RPC response to Challenge format
    const sourceMap: Record<ChallengeType, Challenge['sources']> = {
      'air-quality': ['EEA', 'GHSL'],
      'heat': ['Meteoalarm', 'GHSL'],
      'floods': ['EA', 'GloFAS', 'GHSL'],
      'wildfire': ['FIRMS', 'GHSL']
    };

    const peopleExposed = data.peopleExposed || 0;
    const exposureTrend: 'up' | 'down' | 'flat' = 
      data.intensity > 0.7 ? 'up' : 
      data.intensity < 0.3 ? 'down' : 'flat';

    return {
      id: `${type}-${regionCode}`,
      type,
      regionName: data.regionName,
      regionCode: data.regionCode || regionCode,
      countryCode: data.countryCode,
      score: data.score,
      freshness: data.freshness as Challenge['freshness'],
      intensity: data.intensity,
      exposure: data.exposure,
      persistence: data.persistence,
      peopleExposed,
      exposureTrend,
      updatedIso: data.updatedIso,
      sources: data.sources || sourceMap[type],
      hasOverride: data.hasOverride || false,
      overrideNote: data.overrideNote
    };
  } catch (error) {
    console.error(`❌ Failed to fetch challenge detail for ${type}/${regionCode}:`, error);
    return null;
  }
};

// Submit admin override using Supabase edge function with real JWT
export const submitAdminOverride = async (type: ChallengeType, regionCode: string, score: number, note: string): Promise<boolean> => {
  try {
    // Get current user session with JWT token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.access_token) {
      console.error('❌ No valid session for admin operation:', sessionError?.message)
      throw new Error('Authentication required - please login')
    }

    const typeMap: Record<ChallengeType, string> = {
      'air-quality': 'air_quality',
      'heat': 'heat',
      'floods': 'floods',
      'wildfire': 'wildfire'
    };

    const response = await fetch(`${edgeFunctions.adminApi}/api/admin/override`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`, // Real JWT token
      },
      body: JSON.stringify({
        type: typeMap[type],
        region_code: regionCode,
        score,
        note
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required - please login')
      } else if (response.status === 403) {
        throw new Error('Admin access required - insufficient permissions')
      }
      throw new Error(`Admin override failed: ${response.status}`)
    }

    return true;
  } catch (error) {
    console.error(`❌ Failed to submit admin override:`, error);
    return false;
  }
};

// Get all challenges for admin console
export const getAllChallenges = async (): Promise<Challenge[]> => {
  try {
    const [airQuality, heat, floods, wildfire] = await Promise.all([
      getChallenges('air-quality'),
      getChallenges('heat'),
      getChallenges('floods'),
      getChallenges('wildfire')
    ]);

    return [...airQuality, ...heat, ...floods, ...wildfire];
  } catch (error) {
    console.error(`❌ Failed to fetch all challenges:`, error);
    return [];
  }
};

// Trigger score computation using Supabase edge function with real JWT
export const computeScores = async (types?: ChallengeType[]): Promise<boolean> => {
  try {
    // Get current user session with JWT token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.access_token) {
      console.error('❌ No valid session for admin operation:', sessionError?.message)
      throw new Error('Authentication required - please login')
    }

    const typeMap: Record<ChallengeType, string> = {
      'air-quality': 'air_quality',
      'heat': 'heat',
      'floods': 'floods',
      'wildfire': 'wildfire'
    };

    const backendTypes = types ? types.map(t => typeMap[t]) : Object.values(typeMap);

    const response = await fetch(`${edgeFunctions.ingestionApi}/api/compute-scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`, // Real JWT token
      },
      body: JSON.stringify({ types: backendTypes })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required - please login')
      } else if (response.status === 403) {
        throw new Error('Admin access required - insufficient permissions')
      }
      throw new Error(`Score computation failed: ${response.status}`)
    }

    return true;
  } catch (error) {
    console.error(`❌ Failed to compute scores:`, error);
    return false;
  }
};

// Legacy functions for backward compatibility
export const getMockChallenges = (type: ChallengeType): Promise<Challenge[]> => {
  return getChallenges(type);
};

export const getChallengeById = async (id: string, type: ChallengeType): Promise<Challenge | undefined> => {
  // Extract region code from ID (format: "type-regionCode")
  const regionCode = id.split('-')[1];
  if (!regionCode) return undefined;
  
  const challenge = await getChallengeDetail(type, regionCode);
  return challenge || undefined;
};