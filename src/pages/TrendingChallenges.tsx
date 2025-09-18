import React, { useState, useEffect } from 'react';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { ChallengeType } from '../App';
import { apiService, Challenge } from '../services/api';
interface TrendingChallengesProps {
  activeTab: ChallengeType;
  onSelectChallenge: (id: string) => void;
}
export const TrendingChallenges: React.FC<TrendingChallengesProps> = ({
  activeTab,
  onSelectChallenge
}) => {
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [sortBy, setSortBy] = useState<string>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch challenges when component mounts or activeTab changes
  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      try {
        console.log(`🔄 Fetching challenges for ${activeTab}`);
        const data = await apiService.getChallenges(activeTab);
        setChallenges(data);
        setLastUpdated(new Date().toISOString());
        console.log(`✅ Loaded ${data.length} challenges for ${activeTab}`);
      } catch (error) {
        console.error('❌ Failed to fetch challenges:', error);
        setChallenges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [activeTab]);
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
  };
  return <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-te-ink-900 dark:text-white">
          What's challenging people & nature right now
        </h1>
        <p className="text-te-ink-700 dark:text-gray-400">
          Ranked by recent severity, exposure and persistence. Updated
          continuously.
        </p>
        <p className="text-sm text-te-ink-700 dark:text-gray-400">
          Last updated:{' '}
          <time dateTime={lastUpdated}>
            {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Loading...'}
          </time>
        </p>
      </div>
      <LeaderboardTable challenges={challenges} loading={loading} sortBy={sortBy} sortDir={sortDir} onSort={handleSort} onSelectChallenge={onSelectChallenge} challengeType={activeTab} />
    </div>;
};