import React, { useState } from 'react';
type TimeWindow = '24h' | '48h' | '72h' | '7d';
export const TimeWindowSelect: React.FC = () => {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('24h');
  return <div className="space-y-2">
      <label className="block text-sm font-medium text-te-ink-700 dark:text-gray-300">
        Time Window
      </label>
      <div className="grid grid-cols-4 gap-2">
        {(['24h', '48h', '72h', '7d'] as TimeWindow[]).map(window => <button key={window} onClick={() => setTimeWindow(window)} className={`py-1.5 px-3 text-sm font-medium rounded-lg transition-colors ${timeWindow === window ? 'bg-te-primary dark:bg-teal-600 text-white' : 'bg-te-muted dark:bg-gray-800 text-te-ink-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {window}
          </button>)}
      </div>
    </div>;
};