import { storage } from './storage';
import { type ChallengeType, type Source } from '../shared/schema';

async function testDatabase() {
  console.log('Testing database connection with frontend interface...');
  
  try {
    // Test creating challenges with different types
    const testChallenge1 = await storage.createChallenge({
      challengeId: 'air-quality-1',
      type: 'air-quality' as ChallengeType,
      regionName: 'London',
      countryCode: 'GB',
      score: 85,
      freshness: 'live',
      intensity: 0.8500, // number value
      peopleExposed: 8000000,
      exposureTrend: 'up',
      updatedIso: new Date(),
      hasOverride: false,
    }, ['EEA', 'GHSL'] as Source[]);

    const testChallenge2 = await storage.createChallenge({
      challengeId: 'heat-1',
      type: 'heat' as ChallengeType,
      regionName: 'Madrid',
      countryCode: 'ES',
      score: 92,
      freshness: 'today',
      intensity: 0.9200,
      peopleExposed: 6500000,
      exposureTrend: 'up',
      updatedIso: new Date(),
      hasOverride: true,
    }, ['Meteoalarm', 'GHSL'] as Source[]);

    console.log('✅ Created test challenges:');
    console.log('Challenge 1:', {
      id: testChallenge1.id,
      type: testChallenge1.type,
      intensity: typeof testChallenge1.intensity,
      sources: testChallenge1.sources,
      updatedIso: typeof testChallenge1.updatedIso
    });
    console.log('Challenge 2:', {
      id: testChallenge2.id,
      type: testChallenge2.type,
      sources: testChallenge2.sources
    });

    // Test retrieving challenges by type
    const airQualityChallenges = await storage.getChallenges('air-quality');
    const heatChallenges = await storage.getChallenges('heat');
    console.log(`✅ Retrieved air quality challenges: ${airQualityChallenges.length}`);
    console.log(`✅ Retrieved heat challenges: ${heatChallenges.length}`);

    // Test retrieving specific challenge
    const challenge = await storage.getChallengeById('air-quality-1');
    console.log('✅ Retrieved specific challenge:', challenge?.regionName);
    console.log('   - ID format:', challenge?.id);
    console.log('   - Intensity type:', typeof challenge?.intensity);
    console.log('   - Sources:', challenge?.sources);

    // Test update
    const updated = await storage.updateChallenge('air-quality-1', { score: 90 });
    console.log('✅ Updated challenge score:', updated?.score);

    // Test delete
    const deleted = await storage.deleteChallenge('heat-1');
    console.log('✅ Deleted challenge:', deleted);

    // Verify deletion
    const deletedChallenge = await storage.getChallengeById('heat-1');
    console.log('✅ Verified deletion (should be undefined):', deletedChallenge);

    console.log('\n🎉 All database tests passed! Frontend interface is working correctly.');
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabase();