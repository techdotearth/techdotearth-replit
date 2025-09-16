import React from 'react';
import { ChallengeType } from '../App';
interface Tab {
  id: ChallengeType;
  label: string;
}
interface TabNavProps {
  tabs: Tab[];
  activeTab: ChallengeType;
  onTabChange: (tab: ChallengeType) => void;
}
export const TabNav: React.FC<TabNavProps> = ({
  tabs,
  activeTab,
  onTabChange
}) => {
  return <div className="overflow-x-auto">
      <div className="flex space-x-4 py-2 min-w-max">
        {tabs.map(tab => <button key={tab.id} onClick={() => onTabChange(tab.id)} className={`px-4 py-2 font-medium text-sm relative focus:outline-none focus:ring-2 focus:ring-te-primary dark:focus:ring-teal-400 focus:ring-opacity-50 rounded transition-colors ${activeTab === tab.id ? getActiveTabStyles(tab.id) : 'text-te-ink-700 dark:text-gray-400 hover:text-te-ink-900 dark:hover:text-white'}`} aria-current={activeTab === tab.id ? 'page' : undefined}>
            {tab.label}
            {activeTab === tab.id && <div className={`absolute bottom-0 left-0 h-0.5 w-full ${getIndicatorColor(tab.id)}`} />}
          </button>)}
      </div>
    </div>;
};
function getActiveTabStyles(tabId: ChallengeType): string {
  switch (tabId) {
    case 'air-quality':
      return 'text-te-aq dark:text-indigo-400 font-semibold';
    case 'heat':
      return 'text-te-heat dark:text-orange-400 font-semibold';
    case 'floods':
      return 'text-te-flood dark:text-cyan-400 font-semibold';
    case 'wildfire':
      return 'text-te-fire dark:text-red-400 font-semibold';
    default:
      return 'text-te-primary dark:text-teal-400 font-semibold';
  }
}
function getIndicatorColor(tabId: ChallengeType): string {
  switch (tabId) {
    case 'air-quality':
      return 'bg-te-aq dark:bg-indigo-400';
    case 'heat':
      return 'bg-te-heat dark:bg-orange-400';
    case 'floods':
      return 'bg-te-flood dark:bg-cyan-400';
    case 'wildfire':
      return 'bg-te-fire dark:bg-red-400';
    default:
      return 'bg-te-primary dark:bg-teal-400';
  }
}