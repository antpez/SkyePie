import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useTheme as useThemeHook } from '../hooks';
import { lightTheme, darkTheme } from '../styles';
import { ThemeMode } from '../styles/theme';

interface ThemeContextType {
  themeMode: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  isLoading: boolean;
  isInitialized: boolean;
  setTheme: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => void;
  theme: typeof lightTheme | typeof darkTheme;
  refreshSystemTheme: () => Promise<void>;
  actualSystemTheme: 'light' | 'dark' | null;
  setAndroidThemeOverride: (theme: 'light' | 'dark' | null) => void;
  androidThemeOverride: 'light' | 'dark' | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = React.memo(({ children }) => {
  const themeHookResult = useThemeHook();
  
  // Add comprehensive safety checks
  const themeMode = themeHookResult?.themeMode || 'auto';
  const effectiveTheme = themeHookResult?.effectiveTheme || 'light';
  const isLoading = themeHookResult?.isLoading || false;
  const isInitialized = themeHookResult?.isInitialized || false;
  const setTheme = themeHookResult?.setTheme || (() => Promise.resolve());
  const toggleTheme = themeHookResult?.toggleTheme || (() => {});
  const refreshSystemTheme = themeHookResult?.refreshSystemTheme || (() => Promise.resolve());
  const actualSystemTheme = themeHookResult?.actualSystemTheme || null;
  const setAndroidThemeOverride = themeHookResult?.setAndroidThemeOverride || (() => {});
  const androidThemeOverride = themeHookResult?.androidThemeOverride || null;
  
  // Memoize theme selection to prevent recreation
  const theme = useMemo(() => {
    if (!effectiveTheme) {
      console.warn('effectiveTheme is undefined, falling back to light theme');
      return lightTheme;
    }
    return effectiveTheme === 'dark' ? darkTheme : lightTheme;
  }, [effectiveTheme]);

  // Memoize context value to prevent unnecessary re-renders
  const value: ThemeContextType = useMemo(() => ({
    themeMode,
    effectiveTheme,
    isLoading,
    isInitialized,
    setTheme,
    toggleTheme,
    theme,
    refreshSystemTheme,
    actualSystemTheme,
    setAndroidThemeOverride,
    androidThemeOverride,
  }), [themeMode, effectiveTheme, isLoading, isInitialized, setTheme, toggleTheme, theme, refreshSystemTheme, actualSystemTheme, setAndroidThemeOverride, androidThemeOverride]);

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
