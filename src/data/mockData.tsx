import React from 'react';
import { ChallengeType } from '../App';
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
}
const generateMockChallenges = (type: ChallengeType, count: number): Challenge[] => {
  const challenges: Challenge[] = [];
  const regions = {
    GB: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow', 'Cardiff', 'Belfast', 'Liverpool', 'Newcastle', 'East Midlands'],
    FR: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
    ES: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Andalucía'],
    DE: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen'],
    IT: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania']
  };
  const countries = Object.keys(regions);
  const sources: Record<ChallengeType, ('EEA' | 'Meteoalarm' | 'EA' | 'GloFAS' | 'FIRMS' | 'GHSL')[]> = {
    'air-quality': ['EEA', 'GHSL'],
    heat: ['Meteoalarm', 'GHSL'],
    floods: ['EA', 'GloFAS', 'GHSL'],
    wildfire: ['FIRMS', 'GHSL']
  };
  for (let i = 0; i < count; i++) {
    const countryCode = countries[Math.floor(Math.random() * countries.length)];
    const countryRegions = regions[countryCode as keyof typeof regions];
    const regionName = countryRegions[Math.floor(Math.random() * countryRegions.length)];
    const now = new Date();
    const randomHoursAgo = Math.floor(Math.random() * 48);
    const updatedDate = new Date(now.getTime() - randomHoursAgo * 60 * 60 * 1000);
    let freshness: 'live' | 'today' | 'week' | 'stale';
    if (randomHoursAgo < 1) {
      freshness = 'live';
    } else if (randomHoursAgo < 24) {
      freshness = 'today';
    } else if (randomHoursAgo < 168) {
      freshness = 'week';
    } else {
      freshness = 'stale';
    }
    challenges.push({
      id: `${type}-${i}`,
      type,
      regionName,
      countryCode,
      score: Math.floor(Math.random() * 100),
      freshness,
      intensity: Math.random(),
      peopleExposed: Math.floor(Math.random() * 10000000),
      exposureTrend: ['up', 'down', 'flat'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'flat',
      updatedIso: updatedDate.toISOString(),
      sources: sources[type],
      hasOverride: Math.random() > 0.9
    });
  }
  // Sort by score descending
  return challenges.sort((a, b) => b.score - a.score);
};
const airQualityChallenges = generateMockChallenges('air-quality', 24);
const heatChallenges = generateMockChallenges('heat', 24);
const floodsChallenges = generateMockChallenges('floods', 24);
const wildfireChallenges = generateMockChallenges('wildfire', 24);
export const getMockChallenges = (type: ChallengeType): Challenge[] => {
  switch (type) {
    case 'air-quality':
      return airQualityChallenges;
    case 'heat':
      return heatChallenges;
    case 'floods':
      return floodsChallenges;
    case 'wildfire':
      return wildfireChallenges;
  }
};
export const getChallengeById = (id: string, type: ChallengeType): Challenge | undefined => {
  return getMockChallenges(type).find(challenge => challenge.id === id);
};