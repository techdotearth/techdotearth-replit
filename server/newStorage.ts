import { db } from './db';
import { sql } from 'drizzle-orm';
import type { FrontendChallenge } from '../shared/schema';

export interface INewStorage {
  getLeaderboard(type?: string): Promise<any[]>;
  getChallengeDetail(type: string, region: string): Promise<any | undefined>;
  getDataFreshness(): Promise<any[]>;
  createAdminOverride(type: string, region_code: string, score: number, note?: string): Promise<void>;
  createManualScore(data: {
    type: string;
    region_code: string;
    score: number;
    freshness?: string;
    intensity?: number;
    exposure?: number;
    persistence?: number;
    inputs_json?: any;
  }): Promise<void>;
}

export class NewDatabaseStorage implements INewStorage {
  async getLeaderboard(type?: string): Promise<any[]> {
    let result;
    if (type) {
      result = await db.execute(sql`
        SELECT * FROM v_leaderboard 
        WHERE type = ${type}::challenge_type 
        ORDER BY display_score DESC
      `);
    } else {
      result = await db.execute(sql`
        SELECT * FROM v_leaderboard 
        ORDER BY display_score DESC
      `);
    }
    return result.rows;
  }

  async getChallengeDetail(type: string, region: string): Promise<any | undefined> {
    const result = await db.execute(sql`
      SELECT challenge_detail(${type}::challenge_type, ${region})
    `);
    return result.rows[0]?.challenge_detail;
  }

  async getDataFreshness(): Promise<any[]> {
    const result = await db.execute(sql`SELECT * FROM last_fetch_times()`);
    return result.rows;
  }

  async createAdminOverride(type: string, region_code: string, score: number, note?: string): Promise<void> {
    // TODO: Add proper authentication
    const userId = '00000000-0000-0000-0000-000000000000';
    
    await db.execute(sql`
      INSERT INTO admin_override (type, region_code, score, note, created_by, active)
      VALUES (${type}::challenge_type, ${region_code}, ${score}, ${note}, ${userId}::uuid, true)
    `);
  }

  async createManualScore(data: {
    type: string;
    region_code: string;
    score: number;
    freshness?: string;
    intensity?: number;
    exposure?: number;
    persistence?: number;
    inputs_json?: any;
  }): Promise<void> {
    // TODO: Add proper authentication
    const userId = '00000000-0000-0000-0000-000000000000';
    
    const {
      type, region_code, score, 
      freshness = 'today',
      intensity = null, 
      exposure = null, 
      persistence = null,
      inputs_json = null
    } = data;

    await db.execute(sql`
      INSERT INTO manual_score (type, region_code, score, freshness, intensity, exposure, persistence, inputs_json, created_by)
      VALUES (
        ${type}::challenge_type, 
        ${region_code}, 
        ${score}, 
        ${freshness}::freshness, 
        ${intensity}, 
        ${exposure}, 
        ${persistence}, 
        ${inputs_json}::jsonb, 
        ${userId}::uuid
      )
    `);
  }

  // Helper method to transform new database format to old frontend format for compatibility
  async getLeaderboardAsOldFormat(type: string): Promise<FrontendChallenge[]> {
    const leaderboardData = await this.getLeaderboard(type);
    
    return leaderboardData.map((row: any, index: number) => ({
      id: `${row.type}-${row.region_code}`, // Generate ID for compatibility
      type: row.type.replace('_', '-'), // Convert air_quality to air-quality
      regionName: row.region_name,
      countryCode: row.country_code,
      score: Math.round(row.display_score),
      freshness: row.freshness,
      intensity: row.intensity || 0,
      peopleExposed: this.estimatePeopleExposed(row.region_code, row.display_score),
      exposureTrend: this.generateTrend(row.exposure || 0.5),
      updatedIso: row.as_of || new Date().toISOString(),
      sources: this.generateSources(row.type),
      hasOverride: !!row.override_note,
    }));
  }

  private estimatePeopleExposed(regionCode: string, score: number): number {
    // Simple estimation based on region and score
    const basePopulations: { [key: string]: number } = {
      'GB': 67000000,
      'FR': 68000000,
      'DE': 84000000,
      'ES': 48000000,
      'IT': 59000000,
      'NL': 17400000,
      'BE': 11600000,
      'PT': 10300000,
      'SE': 10500000,
      'DK': 5900000,
    };
    
    const basePop = basePopulations[regionCode] || 10000000;
    // Estimate exposure as a percentage of population based on score
    const exposurePercent = Math.min(0.3, score / 300); // Max 30% of population
    return Math.round(basePop * exposurePercent);
  }

  private generateTrend(exposure: number): 'up' | 'down' | 'flat' {
    if (exposure > 0.6) return 'up';
    if (exposure < 0.4) return 'down';
    return 'flat';
  }

  private generateSources(type: string): string[] {
    const sourceMap: { [key: string]: string[] } = {
      'air_quality': ['EEA', 'GHSL'],
      'heat': ['Meteoalarm', 'GHSL'],
      'floods': ['EA', 'GloFAS', 'GHSL'],
      'wildfire': ['FIRMS', 'GHSL']
    };
    return sourceMap[type] || ['GHSL'];
  }
}

export const newStorage = new NewDatabaseStorage();