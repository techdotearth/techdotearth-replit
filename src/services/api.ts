// API service for connecting frontend to backend
import { ChallengeType } from '../App';

// Get the backend API base URL from environment or use localhost for development
const getApiBaseUrl = () => {
  // In Replit, use the backend port with the proper domain
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    // Use port 3001 for backend API
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
  countryCode: string;
  score: number;
  freshness: 'live' | 'today' | 'week' | 'stale';
  intensity: number;
  peopleExposed: number;
  exposureTrend: 'up' | 'down' | 'flat';
  updatedIso: string;
  sources: ('EEA' | 'Meteoalarm' | 'EA' | 'GloFAS' | 'FIRMS' | 'GHSL')[];
  hasOverride: boolean;
  rank?: number;
}

// Backend API response interfaces
interface LeaderboardResponse {
  challenges: Array<{
    type: string;
    region_code: string;
    region_name: string;
    score: number;
    intensity: number;
    freshness: string;
    updated_at: string;
    sources: string[];
    has_override: boolean;
  }>;
}

interface ChallengeDetailResponse {
  type: string;
  region_code: string;
  region_name: string;
  score: number;
  intensity: number;
  exposure: number;
  persistence: number;
  freshness: string;
  updated_at: string;
  sources: string[];
  has_override: boolean;
  notes: string;
}

class ApiService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
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
  }

  // Convert backend leaderboard response to frontend Challenge format
  private convertToChallenge(item: LeaderboardResponse['challenges'][0], rank: number): Challenge {
    // Map backend challenge types to frontend types
    const typeMap: Record<string, ChallengeType> = {
      'air_quality': 'air-quality',
      'heat': 'heat',
      'floods': 'floods',
      'wildfire': 'wildfire'
    };

    const type = typeMap[item.type] || item.type as ChallengeType;
    
    // Estimate people exposed based on region and intensity
    const peopleExposed = Math.floor(item.intensity * 10000000 * (Math.random() * 0.5 + 0.75));
    
    // Determine exposure trend based on intensity
    const exposureTrend: 'up' | 'down' | 'flat' = 
      item.intensity > 0.7 ? 'up' : 
      item.intensity < 0.3 ? 'down' : 'flat';

    return {
      id: `${type}-${item.region_code}`,
      type,
      regionName: item.region_name,
      countryCode: item.region_code,
      score: item.score,
      freshness: item.freshness as Challenge['freshness'],
      intensity: item.intensity,
      peopleExposed,
      exposureTrend,
      updatedIso: item.updated_at,
      sources: item.sources as Challenge['sources'],
      hasOverride: item.has_override,
      rank
    };
  }

  // Get leaderboard data for a specific challenge type
  async getChallenges(type: ChallengeType): Promise<Challenge[]> {
    try {
      const typeMap: Record<ChallengeType, string> = {
        'air-quality': 'air_quality',
        'heat': 'heat',
        'floods': 'floods',
        'wildfire': 'wildfire'
      };

      const backendType = typeMap[type];
      const response = await this.fetchApi<LeaderboardResponse>(`/api/leaderboard?type=${backendType}`);
      
      return response.challenges
        .filter(item => item.type === backendType)
        .map((item, index) => this.convertToChallenge(item, index + 1))
        .sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error(`❌ Failed to fetch challenges for ${type}:`, error);
      // Return empty array on error to prevent UI crashes
      return [];
    }
  }

  // Get detailed information for a specific challenge
  async getChallengeDetail(type: ChallengeType, regionCode: string): Promise<Challenge | null> {
    try {
      const typeMap: Record<ChallengeType, string> = {
        'air-quality': 'air_quality',
        'heat': 'heat',
        'floods': 'floods',
        'wildfire': 'wildfire'
      };

      const backendType = typeMap[type];
      const response = await this.fetchApi<ChallengeDetailResponse>(`/api/challenge/${backendType}/${regionCode}`);
      
      const peopleExposed = Math.floor(response.exposure * 10000000 * (Math.random() * 0.5 + 0.75));
      const exposureTrend: 'up' | 'down' | 'flat' = 
        response.intensity > 0.7 ? 'up' : 
        response.intensity < 0.3 ? 'down' : 'flat';

      return {
        id: `${type}-${regionCode}`,
        type,
        regionName: response.region_name,
        countryCode: regionCode,
        score: response.score,
        freshness: response.freshness as Challenge['freshness'],
        intensity: response.intensity,
        peopleExposed,
        exposureTrend,
        updatedIso: response.updated_at,
        sources: response.sources as Challenge['sources'],
        hasOverride: response.has_override
      };
    } catch (error) {
      console.error(`❌ Failed to fetch challenge detail for ${type}/${regionCode}:`, error);
      return null;
    }
  }

  // Submit admin override
  async submitAdminOverride(type: ChallengeType, regionCode: string, score: number, note: string): Promise<boolean> {
    try {
      const typeMap: Record<ChallengeType, string> = {
        'air-quality': 'air_quality',
        'heat': 'heat',
        'floods': 'floods',
        'wildfire': 'wildfire'
      };

      await this.fetchApi('/api/admin/override', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer admin-token', // In production, use proper auth
        },
        body: JSON.stringify({
          type: typeMap[type],
          region_code: regionCode,
          score,
          note
        })
      });

      return true;
    } catch (error) {
      console.error(`❌ Failed to submit admin override:`, error);
      return false;
    }
  }

  // Get all challenges for admin console
  async getAllChallenges(): Promise<Challenge[]> {
    try {
      const [airQuality, heat, floods, wildfire] = await Promise.all([
        this.getChallenges('air-quality'),
        this.getChallenges('heat'),
        this.getChallenges('floods'),
        this.getChallenges('wildfire')
      ]);

      return [...airQuality, ...heat, ...floods, ...wildfire];
    } catch (error) {
      console.error(`❌ Failed to fetch all challenges:`, error);
      return [];
    }
  }

  // Trigger score computation
  async computeScores(types?: ChallengeType[]): Promise<boolean> {
    try {
      const typeMap: Record<ChallengeType, string> = {
        'air-quality': 'air_quality',
        'heat': 'heat',
        'floods': 'floods',
        'wildfire': 'wildfire'
      };

      const backendTypes = types ? types.map(t => typeMap[t]) : Object.values(typeMap);

      await this.fetchApi('/api/compute-scores', {
        method: 'POST',
        body: JSON.stringify({ types: backendTypes })
      });

      return true;
    } catch (error) {
      console.error(`❌ Failed to compute scores:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export legacy functions for gradual migration
export const getMockChallenges = (type: ChallengeType): Promise<Challenge[]> => {
  return apiService.getChallenges(type);
};

export const getChallengeById = async (id: string, type: ChallengeType): Promise<Challenge | undefined> => {
  // Extract region code from ID (format: "type-regionCode")
  const regionCode = id.split('-')[1];
  if (!regionCode) return undefined;
  
  const challenge = await apiService.getChallengeDetail(type, regionCode);
  return challenge || undefined;
};