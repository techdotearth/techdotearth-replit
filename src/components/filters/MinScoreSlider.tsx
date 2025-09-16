import React, { useState } from 'react';
export const MinScoreSlider: React.FC = () => {
  const [minScore, setMinScore] = useState(0);
  return <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-te-ink-700 dark:text-gray-300">
          Min Score
        </label>
        <span className="text-sm font-medium text-te-ink-900 dark:text-white">
          {minScore}
        </span>
      </div>
      <input type="range" min="0" max="100" value={minScore} onChange={e => setMinScore(parseInt(e.target.value))} className="w-full h-2 bg-te-muted dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-te-primary dark:accent-teal-500" />
      <div className="flex justify-between text-xs text-te-ink-700 dark:text-gray-400">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
    </div>;
};