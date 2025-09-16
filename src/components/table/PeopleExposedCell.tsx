import React from 'react';
import { UserIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon } from 'lucide-react';
type Trend = 'up' | 'down' | 'flat';
interface PeopleExposedCellProps {
  value: number;
  trend: Trend;
}
export const PeopleExposedCell: React.FC<PeopleExposedCellProps> = ({
  value,
  trend
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon className="h-3 w-3 text-red-500" aria-label="Increasing trend" />;
      case 'down':
        return <TrendingDownIcon className="h-3 w-3 text-green-500" aria-label="Decreasing trend" />;
      case 'flat':
        return <MinusIcon className="h-3 w-3 text-gray-500" aria-label="Steady trend" />;
    }
  };
  return <div className="flex items-center">
      <UserIcon className="h-4 w-4 text-te-ink-700 dark:text-gray-400 mr-1.5" />
      <span className="font-medium text-te-ink-900 dark:text-white">
        {formatNumber(value)}
      </span>
      <span className="ml-1.5">{getTrendIcon()}</span>
    </div>;
};