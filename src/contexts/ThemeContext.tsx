import React, { createContext, useContext, ReactNode } from 'react';
import { useTheme as useThemeHook } from '../hooks';
import { lightTheme, darkTheme } from '../styles';
import { ThemeMode } from '../styles/theme';

interface ThemeContextType {
  themeMode: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  isLoading: boolean;
  setTheme: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => void;
  theme: typeof lightTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { themeMode, effectiveTheme, isLoading, setTheme, toggleTheme } = useThemeHook();
  const theme = effectiveTheme === 'dark' ? darkTheme : lightTheme;

  const value: ThemeContextType = {
    themeMode,
    effectiveTheme,
    isLoading,
    setTheme,
    toggleTheme,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
