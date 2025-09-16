import React from 'react';
import { ChallengeType } from '../../App';
type Freshness = 'live' | 'today' | 'week' | 'stale';
interface WhyThisScoreCardProps {
  score: number;
  freshness: Freshness;
  challengeType: ChallengeType;
}
export const WhyThisScoreCard: React.FC<WhyThisScoreCardProps> = ({
  score,
  freshness,
  challengeType
}) => {
  const getExplainerText = () => {
    switch (challengeType) {
      case 'air-quality':
        return '27% of stations poor/very poor for PM2.5; ≈ 6.2M residents affected (7d).';
      case 'heat':
        return 'Orange heat warning across 42% of Andalucía; ≈ 1.3M people exposed (24h).';
      case 'floods':
        return '5 active flood warnings in East Midlands; ≈ 120k people in affected areas (48h).';
      case 'wildfire':
        return 'High-confidence VIIRS detections clustered near Evros; ≈ 85k residents within 10km (72h).';
    }
  };
  const getHeaderColor = () => {
    switch (challengeType) {
      case 'air-quality':
        return 'bg-indigo-50 dark:bg-indigo-900';
      case 'heat':
        return 'bg-orange-50 dark:bg-orange-900';
      case 'floods':
        return 'bg-cyan-50 dark:bg-cyan-900';
      case 'wildfire':
        return 'bg-red-50 dark:bg-red-900';
      default:
        return 'bg-teal-50 dark:bg-teal-900';
    }
  };
  const getTimestamp = () => {
    return '13:00 BST';
  };
  const getWindow = () => {
    switch (challengeType) {
      case 'air-quality':
        return '7d';
      case 'heat':
        return '24h';
      case 'floods':
        return '48h';
      case 'wildfire':
        return '72h';
    }
  };
  return <div className="w-72 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-te-border dark:border-gray-700 overflow-hidden">
      <div className={`px-4 py-3 ${getHeaderColor()}`}>
        <h3 className="font-medium text-te-ink-900 dark:text-white">
          Why this score?
        </h3>
      </div>
      <div className="p-4">
        <p className="text-sm text-te-ink-900 dark:text-white mb-4">
          {getExplainerText()}
        </p>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-te-ink-700 dark:text-gray-400">
              Intensity
            </span>
            <span className="text-sm font-medium text-te-ink-900 dark:text-white">
              0.72
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-te-ink-700 dark:text-gray-400">
              Exposure
            </span>
            <span className="text-sm font-medium text-te-ink-900 dark:text-white">
              0.85
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-te-ink-700 dark:text-gray-400">
              Persistence
            </span>
            <span className="text-sm font-medium text-te-ink-900 dark:text-white">
              0.68
            </span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-te-border dark:border-gray-700">
          <div className="text-xs text-te-ink-700 dark:text-gray-400">
            As of {getTimestamp()} · Window: {getWindow()}
          </div>
        </div>
      </div>
    </div>;
};