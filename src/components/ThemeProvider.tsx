import React, { createContext, useContext } from 'react';
type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
}
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light'
});
export const useTheme = () => useContext(ThemeContext);
interface ThemeProviderProps {
  children: ReactNode;
  theme: Theme;
}
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme
}) => {
  return <ThemeContext.Provider value={{
    theme
  }}>
      <div className={`${theme === 'dark' ? 'dark' : ''}`}>
        <div className="bg-te-surface text-te-ink-900 dark:bg-te-ink-900 dark:text-white min-h-screen transition-colors duration-200">
          {children}
        </div>
      </div>
    </ThemeContext.Provider>;
};