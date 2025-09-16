import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, InfoIcon, UserIcon } from 'lucide-react';
import { RankBadge } from './table/RankBadge';
import { RegionCell } from './table/RegionCell';
import { ScoreChip } from './table/ScoreChip';
import { IntensityBar } from './table/IntensityBar';
import { PeopleExposedCell } from './table/PeopleExposedCell';
import { UpdatedCell } from './table/UpdatedCell';
import { SourceBadges } from './table/SourceBadges';
import { Challenge } from '../data/mockData';
import { ChallengeType } from '../App';
interface LeaderboardTableProps {
  challenges: Challenge[];
  loading: boolean;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSort: (column: string) => void;
  onSelectChallenge: (id: string) => void;
  challengeType: ChallengeType;
}
export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  challenges,
  loading,
  sortBy,
  sortDir,
  onSort,
  onSelectChallenge,
  challengeType
}) => {
  if (loading) {
    return <TableSkeleton />;
  }
  if (challenges.length === 0) {
    return <EmptyState />;
  }
  return <div className="bg-white dark:bg-gray-900 rounded-2xl border border-te-border dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-te-muted dark:bg-gray-800 border-b border-te-border dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-te-ink-700 dark:text-gray-400 uppercase tracking-wider w-12">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-te-ink-700 dark:text-gray-400 uppercase tracking-wider">
                <button className="flex items-center focus:outline-none focus:underline" onClick={() => onSort('region')}>
                  Region
                  {sortBy === 'region' && <span className="ml-1">
                      {sortDir === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                    </span>}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-te-ink-700 dark:text-gray-400 uppercase tracking-wider w-28">
                <button className="flex items-center focus:outline-none focus:underline" onClick={() => onSort('score')}>
                  Score
                  {sortBy === 'score' && <span className="ml-1">
                      {sortDir === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                    </span>}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-te-ink-700 dark:text-gray-400 uppercase tracking-wider">
                <button className="flex items-center focus:outline-none focus:underline" onClick={() => onSort('intensity')}>
                  Intensity
                  {sortBy === 'intensity' && <span className="ml-1">
                      {sortDir === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                    </span>}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-te-ink-700 dark:text-gray-400 uppercase tracking-wider">
                <button className="flex items-center focus:outline-none focus:underline" onClick={() => onSort('peopleExposed')}>
                  People Exposed
                  {sortBy === 'peopleExposed' && <span className="ml-1">
                      {sortDir === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                    </span>}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-te-ink-700 dark:text-gray-400 uppercase tracking-wider">
                <button className="flex items-center focus:outline-none focus:underline" onClick={() => onSort('updated')}>
                  Updated
                  {sortBy === 'updated' && <span className="ml-1">
                      {sortDir === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                    </span>}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-te-ink-700 dark:text-gray-400 uppercase tracking-wider">
                Sources
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-te-border dark:divide-gray-700">
            {challenges.map((challenge, index) => <tr key={challenge.id} onClick={() => onSelectChallenge(challenge.id)} className="hover:bg-te-muted dark:hover:bg-gray-800 cursor-pointer transition-colors">
                <td className="px-4 py-4 whitespace-nowrap">
                  <RankBadge rank={index + 1} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <RegionCell regionName={challenge.regionName} countryCode={challenge.countryCode} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <ScoreChip score={challenge.score} freshness={challenge.freshness} challengeType={challengeType} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <IntensityBar value={challenge.intensity} challengeType={challengeType} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <PeopleExposedCell value={challenge.peopleExposed} trend={challenge.exposureTrend} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <UpdatedCell timestamp={challenge.updatedIso} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <SourceBadges sources={challenge.sources} />
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>;
};
const TableSkeleton: React.FC = () => {
  return <div className="bg-white dark:bg-gray-900 rounded-2xl border border-te-border dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-te-muted dark:bg-gray-800 border-b border-te-border dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-te-ink-700 dark:text-gray-400 uppercase tracking-wider w-12">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-te-ink-700 dark:text-gray-400 uppercase tracking-wider">
                Region
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-te-ink-700 dark:text-gray-400 uppercase tracking-wider w-28">
                Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-te-ink-700 dark:text-gray-400 uppercase tracking-wider">
                Intensity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-te-ink-700 dark:text-gray-400 uppercase tracking-wider">
                People Exposed
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-te-ink-700 dark:text-gray-400 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-te-ink-700 dark:text-gray-400 uppercase tracking-wider">
                Sources
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-te-border dark:divide-gray-700">
            {[...Array(5)].map((_, i) => <tr key={i}>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>;
};
const EmptyState: React.FC = () => {
  return <div className="bg-white dark:bg-gray-900 rounded-2xl border border-te-border dark:border-gray-700 p-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-te-muted dark:bg-gray-800 rounded-full mb-4">
        <InfoIcon className="h-8 w-8 text-te-ink-700 dark:text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-te-ink-900 dark:text-white mb-2">
        No results match your filters
      </h3>
      <p className="text-te-ink-700 dark:text-gray-400 max-w-md mx-auto">
        Try adjusting your filters or selecting a different challenge type to
        see more results.
      </p>
      <button className="mt-4 px-4 py-2 bg-te-primary dark:bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors">
        Reset Filters
      </button>
    </div>;
};