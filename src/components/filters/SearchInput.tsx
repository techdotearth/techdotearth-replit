import React from 'react';
import { SearchIcon } from 'lucide-react';
export const SearchInput: React.FC = () => {
  return <div className="space-y-2">
      <label className="block text-sm font-medium text-te-ink-700 dark:text-gray-300">
        Search
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-4 w-4 text-gray-500" />
        </div>
        <input type="text" placeholder="Region or keyword..." className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-te-border dark:border-gray-700 rounded-lg text-sm text-te-ink-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-te-primary dark:focus:ring-teal-500" />
      </div>
    </div>;
};