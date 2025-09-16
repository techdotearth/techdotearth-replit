import React, { useState } from 'react';
import { AppShell } from './components/AppShell';
import { TrendingChallenges } from './pages/TrendingChallenges';
import { ChallengeDetail } from './pages/ChallengeDetail';
import { About } from './pages/About';
import { AdminConsole } from './pages/AdminConsole';
import { ThemeProvider } from './components/ThemeProvider';
export type ChallengeType = 'air-quality' | 'heat' | 'floods' | 'wildfire';
export function App() {
  const [currentPage, setCurrentPage] = useState<'trending' | 'detail' | 'about' | 'admin'>('trending');
  const [activeTab, setActiveTab] = useState<ChallengeType>('air-quality');
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const handleTabChange = (tab: ChallengeType) => {
    setActiveTab(tab);
    setSelectedChallenge(null);
  };
  const handleNavigate = (page: 'trending' | 'detail' | 'about' | 'admin', challengeId?: string) => {
    setCurrentPage(page);
    if (challengeId) {
      setSelectedChallenge(challengeId);
    }
  };
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  const renderPage = () => {
    switch (currentPage) {
      case 'trending':
        return <TrendingChallenges activeTab={activeTab} onSelectChallenge={id => handleNavigate('detail', id)} />;
      case 'detail':
        return <ChallengeDetail challengeId={selectedChallenge!} challengeType={activeTab} onBack={() => handleNavigate('trending')} />;
      case 'about':
        return <About onBack={() => handleNavigate('trending')} />;
      case 'admin':
        return <AdminConsole onBack={() => handleNavigate('trending')} />;
      default:
        return null;
    }
  };
  return <ThemeProvider theme={theme}>
      <AppShell activeTab={activeTab} onTabChange={handleTabChange} onNavigate={handleNavigate} theme={theme} onToggleTheme={toggleTheme} currentPage={currentPage}>
        {renderPage()}
      </AppShell>
    </ThemeProvider>;
}