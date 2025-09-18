import { useState, useEffect, useCallback } from 'react';
import { useColorScheme, Appearance, Platform } from 'react-native';
import { ThemeMode } from '../styles/theme';
import { storageService } from '../services';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [isLoading, setIsLoading] = useState(true);
  const [actualSystemTheme, setActualSystemTheme] = useState<'light' | 'dark' | null>(null);
  const [androidThemeOverride, setAndroidThemeOverride] = useState<'light' | 'dark' | null>(null);
  const [autoThemeUpdate, setAutoThemeUpdate] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadTheme = useCallback(async () => {
    try {
      console.log('🔄 Starting theme loading...');
      
      // Simplified theme loading with shorter timeout
      const themePromise = (async () => {
        const savedTheme = await storageService.getTheme();
        console.log('Loading theme from storage:', savedTheme);
        
        setThemeMode(savedTheme);
        
        // Get system theme with simplified detection
        const currentSystemTheme = Appearance.getColorScheme();
        console.log('System theme detection:', {
          useColorScheme: systemColorScheme,
          Appearance: currentSystemTheme,
          Platform: require('react-native').Platform.OS
        });
        setActualSystemTheme(currentSystemTheme || null);
      })();

      // Race between theme loading and timeout (reduced to 1.5 seconds)
      await Promise.race([
        themePromise,
        new Promise(resolve => setTimeout(resolve, 1500))
      ]);
      
      // Mark as initialized
      setIsInitialized(true);
      console.log('✅ Theme loading completed and initialized');
      
    } catch (error) {
      console.error('Error loading theme:', error);
      // Even on error, mark as initialized to prevent infinite loading
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  }, [systemColorScheme]);

  const saveTheme = useCallback(async (mode: ThemeMode) => {
    try {
      console.log('Saving theme:', mode);
      // Use the mode directly
      const storageMode = mode;
      await storageService.saveTheme(storageMode);
      setThemeMode(mode);
      console.log('Theme saved and state updated:', mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, []);

  const getEffectiveTheme = useCallback(() => {
    // If not initialized yet, return a safe default
    if (!isInitialized) {
      console.log('Theme not initialized yet, returning light theme');
      return 'light';
    }
    
    // For Android, always check override first
    if (require('react-native').Platform.OS === 'android' && androidThemeOverride) {
      console.log('Android theme override active:', {
        override: androidThemeOverride,
        effective: androidThemeOverride
      });
      return androidThemeOverride;
    }
    
    if (themeMode === 'auto') {
      // Auto mode: dark from sunset to sunrise, light from sunrise to sunset
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      
      // Simple approximation: dark from 6 PM to 6 AM, light from 6 AM to 6 PM
      const isDarkTime = currentHour >= 18 || currentHour < 6;
      const effective = isDarkTime ? 'dark' : 'light';
      
      console.log('Auto theme calculation:', {
        currentHour,
        isDarkTime,
        effective,
        themeMode
      });
      return effective;
    }
    
    return themeMode === 'light' ? 'light' : themeMode === 'dark' ? 'dark' : 'light';
  }, [themeMode, systemColorScheme, actualSystemTheme, androidThemeOverride, isInitialized]);

  // Simplified Android theme detection
  const detectAndroidSystemTheme = useCallback(() => {
    try {
      const { Platform } = require('react-native');
      
      if (Platform.OS === 'android') {
        // Use the standard Appearance API - it works fine on most Android versions
        const { Appearance } = require('react-native');
        const currentTheme = Appearance.getColorScheme();
        return currentTheme;
      }
      
      return null;
    } catch (error) {
      console.error('Android system theme detection error:', error);
      return null;
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    saveTheme(newTheme);
  }, [themeMode, saveTheme]);

  // Simplified Android theme detection
  const detectAndroidTheme = useCallback(async () => {
    if (require('react-native').Platform.OS !== 'android') return null;
    
    try {
      // Use the standard Appearance API
      const { Appearance } = require('react-native');
      const theme = Appearance.getColorScheme();
      return theme;
    } catch (error) {
      console.warn('Android theme detection failed:', error);
      return null;
    }
  }, []);

  // Force refresh system theme detection (useful for Android)
  const refreshSystemTheme = useCallback(async () => {
    console.log('Manually refreshing system theme...');
    
    // Try standard APIs first
    const appearanceTheme = Appearance.getColorScheme();
    console.log('Appearance API result:', appearanceTheme);
    
    // Try Android-specific detection
    const androidTheme = await detectAndroidTheme();
    console.log('Android detection result:', androidTheme);
    
    // Use the most reliable result
    const finalTheme = androidTheme || appearanceTheme;
    console.log('Final theme selection:', finalTheme);
    
    setActualSystemTheme(finalTheme);
  }, [detectAndroidTheme]);


  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setActualSystemTheme(colorScheme || null);
    });

    return () => subscription?.remove();
  }, []); // Remove actualSystemTheme dependency to prevent loop

  // Auto theme timer - refresh every minute to update based on time
  useEffect(() => {
    if (themeMode === 'auto') {
      const interval = setInterval(() => {
        // Force re-render by updating the auto theme update counter
        setAutoThemeUpdate(prev => prev + 1);
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [themeMode]);

  const setAndroidThemeOverrideCallback = useCallback((theme: 'light' | 'dark' | null) => {
    setAndroidThemeOverride(theme);
    console.log('Android theme override set:', theme);
  }, []);

  const effectiveTheme = getEffectiveTheme();
  
  return {
    themeMode: themeMode || 'auto', // Fallback to 'auto' if undefined
    effectiveTheme: effectiveTheme || 'light', // Ensure effectiveTheme is never undefined
    isLoading: isLoading || !isInitialized, // Show loading until fully initialized
    setTheme: saveTheme,
    toggleTheme,
    refreshSystemTheme,
    actualSystemTheme,
    setAndroidThemeOverride: setAndroidThemeOverrideCallback,
    androidThemeOverride,
    isInitialized, // Expose initialization state
  };
};
