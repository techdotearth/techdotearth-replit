import React, { useState } from 'react';
import { UserIcon, LeafIcon } from 'lucide-react';
type ChallengeCategory = 'people' | 'nature' | 'both';
export const PeopleNatureChips: React.FC = () => {
  const [category, setCategory] = useState<ChallengeCategory>('both');
  const handleClick = (selected: 'people' | 'nature') => {
    if (category === 'both') {
      setCategory(selected);
    } else if (category === selected) {
      setCategory('both');
    } else {
      setCategory(selected);
    }
  };
  return <div className="space-y-2">
      <label className="block text-sm font-medium text-te-ink-700 dark:text-gray-300">
        Challenge Category
      </label>
      <div className="flex space-x-2">
        <button onClick={() => handleClick('people')} className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-xl text-sm font-medium transition-colors ${category === 'people' || category === 'both' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-te-muted dark:bg-gray-800 text-te-ink-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
          <UserIcon className="h-4 w-4" />
          <span>People</span>
        </button>
        <button onClick={() => handleClick('nature')} className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-xl text-sm font-medium transition-colors ${category === 'nature' || category === 'both' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-te-muted dark:bg-gray-800 text-te-ink-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
          <LeafIcon className="h-4 w-4" />
          <span>Nature</span>
        </button>
      </div>
    </div>;
};