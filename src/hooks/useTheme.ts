import { useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeMode } from '../styles/theme';
import { storageService } from '../services';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  const loadTheme = useCallback(async () => {
    try {
      const savedTheme = await storageService.getTheme();
      console.log('Loading theme from storage:', savedTheme);
      setThemeMode(savedTheme);
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveTheme = useCallback(async (mode: ThemeMode) => {
    try {
      console.log('Saving theme:', mode);
      await storageService.saveTheme(mode);
      setThemeMode(mode);
      console.log('Theme saved and state updated:', mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, []);

  const getEffectiveTheme = useCallback(() => {
    const effective = themeMode === 'system' 
      ? (systemColorScheme === 'dark' ? 'dark' : 'light')
      : (themeMode || 'light');
    
    return effective;
  }, [themeMode, systemColorScheme]);

  const toggleTheme = useCallback(() => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    saveTheme(newTheme);
  }, [themeMode, saveTheme]);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  return {
    themeMode: themeMode || 'system', // Fallback to 'system' if undefined
    effectiveTheme: getEffectiveTheme(),
    isLoading,
    setTheme: saveTheme,
    toggleTheme,
  };
};
