import React from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { ChallengeType } from '../App';
interface MiniMapPanelProps {
  challengeType: ChallengeType;
  regionName: string;
}
export const MiniMapPanel: React.FC<MiniMapPanelProps> = ({
  challengeType,
  regionName
}) => {
  const getMapOverlayColor = () => {
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
  return <div className="relative h-64 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
      {/* Placeholder for the map */}
      <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <div className="text-sm font-medium mb-1">
            Map view for {regionName}
          </div>
          <div className="text-xs">Placeholder for map visualization</div>
        </div>
      </div>
      {/* Map overlay */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path d="M50,50 L150,50 L200,100 L150,150 L100,150 Z" fill={getMapOverlayColor()} fillOpacity="0.3" stroke={getMapOverlayColor()} strokeWidth="2" />
      </svg>
      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex items-center space-x-2">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-sm mr-1" style={{
          backgroundColor: getMapOverlayColor()
        }}></div>
          <span className="text-xs text-te-ink-900 dark:text-white">
            Affected area
          </span>
        </div>
      </div>
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 flex flex-col space-y-1">
        <button className="h-8 w-8 bg-white dark:bg-gray-800 rounded-md flex items-center justify-center text-te-ink-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Zoom in">
          <PlusIcon className="h-4 w-4" />
        </button>
        <button className="h-8 w-8 bg-white dark:bg-gray-800 rounded-md flex items-center justify-center text-te-ink-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Zoom out">
          <MinusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>;
};