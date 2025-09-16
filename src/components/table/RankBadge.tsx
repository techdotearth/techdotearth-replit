import React from 'react';
interface RankBadgeProps {
  rank: number;
}
export const RankBadge: React.FC<RankBadgeProps> = ({
  rank
}) => {
  let badgeClass = 'flex items-center justify-center h-6 w-6 rounded-full text-xs font-semibold';
  if (rank === 1) {
    badgeClass += ' bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  } else if (rank === 2) {
    badgeClass += ' bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  } else if (rank === 3) {
    badgeClass += ' bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
  } else {
    badgeClass += ' border border-gray-300 dark:border-gray-700 text-te-ink-700 dark:text-gray-400';
  }
  return <div className={badgeClass}>{rank}</div>;
};