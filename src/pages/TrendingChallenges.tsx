import React, { useState } from 'react';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { ChallengeType } from '../App';
import { getMockChallenges } from '../data/mockData';
interface TrendingChallengesProps {
  activeTab: ChallengeType;
  onSelectChallenge: (id: string) => void;
}
export const TrendingChallenges: React.FC<TrendingChallengesProps> = ({
  activeTab,
  onSelectChallenge
}) => {
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<string>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const challenges = getMockChallenges(activeTab);
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
          <time dateTime="2023-06-15T13:45:00Z">June 15, 2023 13:45 BST</time>
        </p>
      </div>
      <LeaderboardTable challenges={challenges} loading={loading} sortBy={sortBy} sortDir={sortDir} onSort={handleSort} onSelectChallenge={onSelectChallenge} challengeType={activeTab} />
    </div>;
};