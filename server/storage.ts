import { challenges, challengeSources, aqObservations, type Challenge, type InsertChallenge, type ChallengeType, type FrontendChallenge, type Source, type InsertAqObservation } from "../shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  getChallenges(type: ChallengeType): Promise<FrontendChallenge[]>;
  getChallengeById(id: string, type?: ChallengeType): Promise<FrontendChallenge | undefined>;
  createChallenge(insertChallenge: InsertChallenge, sources: Source[]): Promise<FrontendChallenge>;
  updateChallenge(id: string, challenge: Partial<InsertChallenge>): Promise<FrontendChallenge | undefined>;
  deleteChallenge(id: string): Promise<boolean>;
  insertAirQualityObservations(observations: InsertAqObservation[]): Promise<{ inserted: number }>;
}

// Helper function to map database records to frontend interface
function mapToFrontendChallenge(challenge: Challenge, sources: Source[] = []): FrontendChallenge {
  return {
    id: challenge.challengeId, // Use challengeId as the frontend ID
    type: challenge.type,
    regionName: challenge.regionName,
    countryCode: challenge.countryCode,
    score: challenge.score,
    freshness: challenge.freshness,
    intensity: challenge.intensity, // Now properly typed as number
    peopleExposed: challenge.peopleExposed,
    exposureTrend: challenge.exposureTrend,
    updatedIso: challenge.updatedIso.toISOString(), // Convert to ISO string
    sources: sources,
    hasOverride: challenge.hasOverride,
  };
}

export class DatabaseStorage implements IStorage {
  async getChallenges(type: ChallengeType): Promise<FrontendChallenge[]> {
    const challengeList = await db
      .select({
        challenge: challenges,
        source: challengeSources.source
      })
      .from(challenges)
      .leftJoin(challengeSources, eq(challenges.id, challengeSources.challengeId))
      .where(eq(challenges.type, type))
      .orderBy(desc(challenges.score));

    // Group sources by challenge and map to frontend interface
    const challengeMap = new Map<number, { challenge: Challenge; sources: Source[] }>();
    challengeList.forEach(row => {
      const challengeId = row.challenge.id;
      if (!challengeMap.has(challengeId)) {
        challengeMap.set(challengeId, {
          challenge: row.challenge,
          sources: []
        });
      }
      if (row.source) {
        challengeMap.get(challengeId)!.sources.push(row.source);
      }
    });

    return Array.from(challengeMap.values()).map(({ challenge, sources }) =>
      mapToFrontendChallenge(challenge, sources)
    );
  }

  async getChallengeById(id: string, type?: ChallengeType): Promise<FrontendChallenge | undefined> {
    const whereConditions = type 
      ? and(eq(challenges.challengeId, id), eq(challenges.type, type))
      : eq(challenges.challengeId, id);

    const challengeData = await db
      .select({
        challenge: challenges,
        source: challengeSources.source
      })
      .from(challenges)
      .leftJoin(challengeSources, eq(challenges.id, challengeSources.challengeId))
      .where(whereConditions);

    if (challengeData.length === 0) return undefined;

    const challenge = challengeData[0].challenge;
    const sources = challengeData
      .filter(row => row.source !== null)
      .map(row => row.source!) as Source[];

    return mapToFrontendChallenge(challenge, sources);
  }

  async createChallenge(insertChallenge: InsertChallenge, sources: Source[]): Promise<FrontendChallenge> {
    const [challenge] = await db
      .insert(challenges)
      .values(insertChallenge)
      .returning();

    // Insert sources for this challenge
    if (sources.length > 0) {
      await db.insert(challengeSources).values(
        sources.map(source => ({
          challengeId: challenge.id,
          source: source,
        }))
      );
    }

    return mapToFrontendChallenge(challenge, sources);
  }

  async updateChallenge(id: string, challenge: Partial<InsertChallenge>): Promise<FrontendChallenge | undefined> {
    const [updatedChallenge] = await db
      .update(challenges)
      .set({ ...challenge, updatedAt: new Date() })
      .where(eq(challenges.challengeId, id))
      .returning();

    if (!updatedChallenge) return undefined;

    // Get the sources for this challenge
    const challengeSourcesList = await db
      .select({ source: challengeSources.source })
      .from(challengeSources)
      .where(eq(challengeSources.challengeId, updatedChallenge.id));

    const sources = challengeSourcesList.map(cs => cs.source) as Source[];
    return mapToFrontendChallenge(updatedChallenge, sources);
  }

  async deleteChallenge(id: string): Promise<boolean> {
    // Find the challenge first (without hardcoding type)
    const [challenge] = await db
      .select({ id: challenges.id })
      .from(challenges)
      .where(eq(challenges.challengeId, id));
    
    if (!challenge) return false;

    // Delete the challenge (sources will be cascade deleted due to foreign key constraint)
    const result = await db.delete(challenges).where(eq(challenges.challengeId, id));
    return (result.rowCount ?? 0) > 0;
  }

  async insertAirQualityObservations(observations: InsertAqObservation[]): Promise<{ inserted: number }> {
    try {
      if (observations.length === 0) {
        return { inserted: 0 };
      }

      console.log(`💾 Inserting ${observations.length} observations to aq_observations table...`);

      // Insert in batches for performance, using onConflictDoNothing for deduplication
      const batchSize = 1000;
      let totalInserted = 0;

      for (let i = 0; i < observations.length; i += batchSize) {
        const batch = observations.slice(i, i + batchSize);
        
        const result = await db
          .insert(aqObservations)
          .values(batch)
          .onConflictDoNothing({ target: [
            aqObservations.stationId, 
            aqObservations.pollutant, 
            aqObservations.observedAt
          ] });
        
        totalInserted += result.rowCount || 0;
        console.log(`📊 Batch ${Math.floor(i / batchSize) + 1}: ${result.rowCount || 0} rows inserted`);
      }

      console.log(`✅ Total inserted: ${totalInserted} air quality observations`);
      return { inserted: totalInserted };
    } catch (error: any) {
      console.error('❌ Failed to insert air quality observations:', error.message);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();