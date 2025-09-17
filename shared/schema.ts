import { pgTable, serial, text, integer, decimal, timestamp, boolean, pgEnum, foreignKey, unique, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define enums for challenge types and other categorical data
export const challengeTypeEnum = pgEnum('challenge_type', ['air-quality', 'heat', 'floods', 'wildfire']);
export const freshnessEnum = pgEnum('freshness', ['live', 'today', 'week', 'stale']);
export const exposureTrendEnum = pgEnum('exposure_trend', ['up', 'down', 'flat']);
export const sourceEnum = pgEnum('source', ['EEA', 'Meteoalarm', 'EA', 'GloFAS', 'FIRMS', 'GHSL']);

// Challenges table
export const challenges = pgTable('challenges', {
  id: serial('id').primaryKey(),
  challengeId: text('challenge_id').notNull().unique(), // The original string ID from the frontend
  type: challengeTypeEnum('type').notNull(),
  regionName: text('region_name').notNull(),
  countryCode: text('country_code').notNull(),
  score: integer('score').notNull(),
  freshness: freshnessEnum('freshness').notNull(),
  intensity: decimal('intensity', { precision: 5, scale: 4, mode: 'number' }).notNull(), // Return as number, not string
  peopleExposed: integer('people_exposed').notNull(),
  exposureTrend: exposureTrendEnum('exposure_trend').notNull(),
  updatedIso: timestamp('updated_iso').notNull(),
  hasOverride: boolean('has_override').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Add index for common query patterns
  typeScoreIdx: index('challenges_type_score_idx').on(table.type, table.score),
  challengeIdIdx: index('challenges_challenge_id_idx').on(table.challengeId),
}));

// Challenge sources table (many-to-many relationship)
export const challengeSources = pgTable('challenge_sources', {
  id: serial('id').primaryKey(),
  challengeId: integer('challenge_id').notNull(),
  source: sourceEnum('source').notNull(),
}, (table) => ({
  // Foreign key constraint with cascade delete
  challengeFk: foreignKey({
    columns: [table.challengeId],
    foreignColumns: [challenges.id],
    name: 'challenge_sources_challenge_id_fk'
  }).onDelete('cascade'),
  // Unique constraint to prevent duplicate sources for the same challenge
  challengeSourceUnique: unique('challenge_source_unique').on(table.challengeId, table.source),
}));

// Define relations
export const challengesRelations = relations(challenges, ({ many }) => ({
  sources: many(challengeSources),
}));

export const challengeSourcesRelations = relations(challengeSources, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeSources.challengeId],
    references: [challenges.id],
  }),
}));

// Types for TypeScript usage
export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;
export type ChallengeSource = typeof challengeSources.$inferSelect;
export type InsertChallengeSource = typeof challengeSources.$inferInsert;

// Export type aliases that match the frontend interface
export type ChallengeType = 'air-quality' | 'heat' | 'floods' | 'wildfire';
export type Freshness = 'live' | 'today' | 'week' | 'stale';
export type ExposureTrend = 'up' | 'down' | 'flat';
export type Source = 'EEA' | 'Meteoalarm' | 'EA' | 'GloFAS' | 'FIRMS' | 'GHSL';

// Frontend-compatible interface that matches the existing React component expectations
export interface FrontendChallenge {
  id: string; // Use challengeId as the frontend ID
  type: ChallengeType;
  regionName: string;
  countryCode: string;
  score: number;
  freshness: Freshness;
  intensity: number; // Ensure this is a number, not string
  peopleExposed: number;
  exposureTrend: ExposureTrend;
  updatedIso: string; // ISO string format for frontend
  sources: Source[]; // Array of sources
  hasOverride: boolean;
}