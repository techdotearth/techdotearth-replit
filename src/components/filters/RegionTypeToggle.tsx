import React, { useState } from 'react';
export const RegionTypeToggle: React.FC = () => {
  const [regionType, setRegionType] = useState<'country' | 'sub-region'>('country');
  return <div className="space-y-2">
      <label className="block text-sm font-medium text-te-ink-700 dark:text-gray-300">
        Region Type
      </label>
      <div className="flex p-1 bg-te-muted dark:bg-gray-800 rounded-lg">
        <button onClick={() => setRegionType('country')} className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${regionType === 'country' ? 'bg-white dark:bg-gray-700 text-te-ink-900 dark:text-white shadow-sm' : 'text-te-ink-700 dark:text-gray-400 hover:text-te-ink-900 dark:hover:text-white'}`}>
          Country
        </button>
        <button onClick={() => setRegionType('sub-region')} className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${regionType === 'sub-region' ? 'bg-white dark:bg-gray-700 text-te-ink-900 dark:text-white shadow-sm' : 'text-te-ink-700 dark:text-gray-400 hover:text-te-ink-900 dark:hover:text-white'}`}>
          Sub-region (NUTS-3)
        </button>
      </div>
    </div>;
};