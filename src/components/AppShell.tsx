import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { TabNav } from './TabNav';
import { FiltersPanel } from './FiltersPanel';
import { FilterSheet } from './FilterSheet';
import { ChallengeType } from '../App';
interface AppShellProps {
  children: React.ReactNode;
  activeTab: ChallengeType;
  onTabChange: (tab: ChallengeType) => void;
  onNavigate: (page: 'trending' | 'detail' | 'about' | 'admin', challengeId?: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  currentPage: 'trending' | 'detail' | 'about' | 'admin';
}
export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeTab,
  onTabChange,
  onNavigate,
  theme,
  onToggleTheme,
  currentPage
}) => {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  return <div className="flex flex-col min-h-screen">
      <TopBar onNavigate={onNavigate} theme={theme} onToggleTheme={onToggleTheme} onOpenFilters={() => setIsFilterSheetOpen(true)} />
      {currentPage === 'trending' && <div className="border-b border-te-border dark:border-gray-700">
          <div className="container mx-auto px-4">
            <TabNav tabs={[{
          id: 'air-quality',
          label: 'Air Quality'
        }, {
          id: 'heat',
          label: 'Heat'
        }, {
          id: 'floods',
          label: 'Floods'
        }, {
          id: 'wildfire',
          label: 'Wildfire'
        }]} activeTab={activeTab} onTabChange={onTabChange} />
          </div>
        </div>}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6">
          {currentPage === 'trending' ? <div className="flex flex-col md:flex-row gap-6">
              <div className="hidden md:block w-64 flex-shrink-0">
                <FiltersPanel />
              </div>
              <div className="flex-grow">{children}</div>
            </div> : children}
        </div>
      </main>
      <FilterSheet isOpen={isFilterSheetOpen} onClose={() => setIsFilterSheetOpen(false)} />
    </div>;
};