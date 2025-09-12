import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useTheme as useThemeHook } from '../hooks';
import { lightTheme, darkTheme } from '../styles';
import { ThemeMode } from '../styles/theme';

interface ThemeContextType {
  themeMode: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  isLoading: boolean;
  setTheme: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => void;
  theme: typeof lightTheme | typeof darkTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = React.memo(({ children }) => {
  const { themeMode, effectiveTheme, isLoading, setTheme, toggleTheme } = useThemeHook();
  
  // Memoize theme selection to prevent recreation
  const theme = useMemo(() => {
    return effectiveTheme === 'dark' ? darkTheme : lightTheme;
  }, [effectiveTheme]);

  // Memoize context value to prevent unnecessary re-renders
  const value: ThemeContextType = useMemo(() => ({
    themeMode,
    effectiveTheme,
    isLoading,
    setTheme,
    toggleTheme,
    theme,
  }), [themeMode, effectiveTheme, isLoading, setTheme, toggleTheme, theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
});

ThemeProvider.displayName = 'ThemeProvider';

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
