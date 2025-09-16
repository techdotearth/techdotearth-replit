import React from 'react';
import { ChallengeType } from '../../App';
interface IntensityBarProps {
  value: number;
  challengeType: ChallengeType;
}
export const IntensityBar: React.FC<IntensityBarProps> = ({
  value,
  challengeType
}) => {
  const getBarColor = () => {
    switch (challengeType) {
      case 'air-quality':
        return 'bg-te-aq dark:bg-indigo-500';
      case 'heat':
        return 'bg-te-heat dark:bg-orange-500';
      case 'floods':
        return 'bg-te-flood dark:bg-cyan-500';
      case 'wildfire':
        return 'bg-te-fire dark:bg-red-500';
      default:
        return 'bg-te-primary dark:bg-teal-500';
    }
  };
  // Convert value (0-1) to percentage width
  const width = `${Math.round(value * 100)}%`;
  return <div className="w-24 h-4 bg-te-muted dark:bg-gray-700 rounded-full overflow-hidden">
      <div className={`h-full ${getBarColor()}`} style={{
      width
    }} aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100} role="progressbar"></div>
    </div>;
};