import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, XIcon } from 'lucide-react';
import { CountrySelect } from './filters/CountrySelect';
import { RegionTypeToggle } from './filters/RegionTypeToggle';
import { TimeWindowSelect } from './filters/TimeWindowSelect';
import { MinScoreSlider } from './filters/MinScoreSlider';
import { PeopleNatureChips } from './filters/PeopleNatureChips';
import { SearchInput } from './filters/SearchInput';
export const FiltersPanel: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return <div className="bg-white dark:bg-gray-900 rounded-2xl border border-te-border dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-te-border dark:border-gray-700">
        <h3 className="font-medium text-te-ink-900 dark:text-white">Filters</h3>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-te-ink-700 dark:text-gray-400 hover:text-te-ink-900 dark:hover:text-white p-1 rounded-full" aria-label={isCollapsed ? 'Expand filters' : 'Collapse filters'}>
          {isCollapsed ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronUpIcon className="h-4 w-4" />}
        </button>
      </div>
      {!isCollapsed && <div className="p-4 space-y-6">
          <CountrySelect />
          <RegionTypeToggle />
          <TimeWindowSelect />
          <MinScoreSlider />
          <PeopleNatureChips />
          <SearchInput />
          <button className="w-full py-2 px-4 bg-te-muted dark:bg-gray-800 text-te-ink-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Reset Filters
          </button>
        </div>}
    </div>;
};