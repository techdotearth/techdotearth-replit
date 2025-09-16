import React from 'react';
import { SearchIcon, MoonIcon, SunIcon, MenuIcon } from 'lucide-react';
interface TopBarProps {
  onNavigate: (page: 'trending' | 'detail' | 'about' | 'admin') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenFilters: () => void;
}
export const TopBar: React.FC<TopBarProps> = ({
  onNavigate,
  theme,
  onToggleTheme,
  onOpenFilters
}) => {
  return <header className="bg-white dark:bg-gray-900 border-b border-te-border dark:border-gray-700 py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => onNavigate('trending')} className="text-te-primary dark:text-teal-400 font-bold text-xl">
              Tech.Earth
            </button>
            <div className="hidden md:flex items-center bg-te-muted dark:bg-gray-800 rounded-full px-3 py-2 w-64">
              <SearchIcon className="h-4 w-4 text-gray-500 mr-2" />
              <input type="text" placeholder="Search challenges..." className="bg-transparent border-none focus:outline-none w-full text-sm" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => onNavigate('about')} className="text-te-ink-700 dark:text-gray-300 hover:text-te-primary dark:hover:text-white text-sm font-medium">
              About
            </button>
            <button onClick={onToggleTheme} className="p-2 rounded-full hover:bg-te-muted dark:hover:bg-gray-800 transition-colors" aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}>
              {theme === 'light' ? <MoonIcon className="h-5 w-5 text-te-ink-700" /> : <SunIcon className="h-5 w-5 text-gray-300" />}
            </button>
            <button className="md:hidden p-2 rounded-full hover:bg-te-muted dark:hover:bg-gray-800 transition-colors" onClick={onOpenFilters} aria-label="Open filters">
              <MenuIcon className="h-5 w-5 text-te-ink-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </header>;
};