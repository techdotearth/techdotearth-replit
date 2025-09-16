import React from 'react';
import { XIcon } from 'lucide-react';
import { CountrySelect } from './filters/CountrySelect';
import { RegionTypeToggle } from './filters/RegionTypeToggle';
import { TimeWindowSelect } from './filters/TimeWindowSelect';
import { MinScoreSlider } from './filters/MinScoreSlider';
import { PeopleNatureChips } from './filters/PeopleNatureChips';
import { SearchInput } from './filters/SearchInput';
interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
}
export const FilterSheet: React.FC<FilterSheetProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-lg flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-te-border dark:border-gray-700">
          <h3 className="font-medium text-te-ink-900 dark:text-white">
            Filters
          </h3>
          <button onClick={onClose} className="text-te-ink-700 dark:text-gray-400 hover:text-te-ink-900 dark:hover:text-white p-1 rounded-full" aria-label="Close filters">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-6">
          <CountrySelect />
          <RegionTypeToggle />
          <TimeWindowSelect />
          <MinScoreSlider />
          <PeopleNatureChips />
          <SearchInput />
        </div>
        <div className="p-4 border-t border-te-border dark:border-gray-700 space-y-3">
          <button onClick={onClose} className="w-full py-2 px-4 bg-te-primary dark:bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors">
            Apply Filters
          </button>
          <button className="w-full py-2 px-4 bg-te-muted dark:bg-gray-800 text-te-ink-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Reset Filters
          </button>
        </div>
      </div>
    </div>;
};