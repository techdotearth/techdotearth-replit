import React from 'react';
import { ChallengeType } from '../App';
interface TrendSparkCardProps {
  challengeType: ChallengeType;
}
export const TrendSparkCard: React.FC<TrendSparkCardProps> = ({
  challengeType
}) => {
  const getSparkLineColor = () => {
    switch (challengeType) {
      case 'air-quality':
        return '#4C51BF';
      case 'heat':
        return '#E25822';
      case 'floods':
        return '#0E7490';
      case 'wildfire':
        return '#B91C1C';
    }
  };
  // Mock data for the sparkline
  const data = [65, 59, 80, 81, 56, 72, 90];
  // Calculate the points for the sparkline
  const calculatePoints = () => {
    const width = 250;
    const height = 50;
    const padding = 5;
    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const xStep = availableWidth / (data.length - 1);
    return data.map((value, index) => {
      const x = padding + index * xStep;
      const y = padding + availableHeight - (value - min) / range * availableHeight;
      return `${x},${y}`;
    }).join(' ');
  };
  return <div className="bg-white dark:bg-gray-900 border border-te-border dark:border-gray-700 rounded-xl overflow-hidden mb-6">
      <div className="bg-te-muted dark:bg-gray-800 px-4 py-3 border-b border-te-border dark:border-gray-700">
        <h2 className="font-medium text-te-ink-900 dark:text-white">
          7-Day Trend
        </h2>
      </div>
      <div className="p-4">
        <div className="h-16 w-full relative" aria-label="7-day score trend chart">
          <svg width="100%" height="100%" viewBox="0 0 250 50" preserveAspectRatio="none">
            <polyline points={calculatePoints()} fill="none" stroke={getSparkLineColor()} strokeWidth="2" />
            <circle cx="250" cy="5" r="3" fill={getSparkLineColor()} />
          </svg>
          <div className="absolute bottom-0 left-0 text-xs text-te-ink-700 dark:text-gray-400">
            Jun 8
          </div>
          <div className="absolute bottom-0 right-0 text-xs text-te-ink-700 dark:text-gray-400">
            Today
          </div>
        </div>
      </div>
    </div>;
};