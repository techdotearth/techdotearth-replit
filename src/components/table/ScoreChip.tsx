import React, { useState } from 'react';
import { ChallengeType } from '../../App';
import { WhyThisScoreCard } from './WhyThisScoreCard';
type Freshness = 'live' | 'today' | 'week' | 'stale';
interface ScoreChipProps {
  score: number;
  freshness: Freshness;
  challengeType: ChallengeType;
}
export const ScoreChip: React.FC<ScoreChipProps> = ({
  score,
  freshness,
  challengeType
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const getBorderColor = () => {
    switch (challengeType) {
      case 'air-quality':
        return 'border-te-aq dark:border-indigo-500';
      case 'heat':
        return 'border-te-heat dark:border-orange-500';
      case 'floods':
        return 'border-te-flood dark:border-cyan-500';
      case 'wildfire':
        return 'border-te-fire dark:border-red-500';
      default:
        return 'border-te-primary dark:border-teal-500';
    }
  };
  const getAnimation = () => {
    if (freshness === 'live') {
      return 'animate-pulse';
    }
    return '';
  };
  return <div className="relative">
      <div className={`inline-flex items-center justify-center px-3 py-1.5 rounded-xl border-2 ${getBorderColor()} ${getAnimation()} bg-white dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer`} onMouseEnter={() => setShowPopover(true)} onMouseLeave={() => setShowPopover(false)} aria-label={`Score ${score}, ${freshness} data`}>
        <span className="text-lg font-bold text-te-ink-900 dark:text-white">
          {score}
        </span>
        <FreshnessBadge freshness={freshness} />
      </div>
      {showPopover && <div className="absolute z-10 top-full left-0 mt-2">
          <WhyThisScoreCard score={score} freshness={freshness} challengeType={challengeType} />
        </div>}
    </div>;
};
interface FreshnessBadgeProps {
  freshness: Freshness;
}
export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({
  freshness
}) => {
  let badgeClass = 'ml-1.5 px-1 py-0.5 text-xs rounded-md';
  switch (freshness) {
    case 'live':
      badgeClass += ' bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      break;
    case 'today':
      badgeClass += ' bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      break;
    case 'week':
      badgeClass += ' bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      break;
    case 'stale':
      badgeClass += ' bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      break;
  }
  return <span className={badgeClass}>{freshness}</span>;
};