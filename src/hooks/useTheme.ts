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

  const loadTheme = useCallback(async () => {
    try {
      const savedTheme = await storageService.getTheme();
      console.log('Loading theme from storage:', savedTheme);
      
      // Use the saved theme directly
      const migratedTheme = savedTheme;
      
      setThemeMode(migratedTheme);
      
      // Get the actual system theme using Appearance API
      const currentSystemTheme = Appearance.getColorScheme();
      
      // More detailed Android debugging
      if (require('react-native').Platform.OS === 'android') {
        console.log('🔍 Android Theme Debug:', {
          'Appearance.getColorScheme()': currentSystemTheme,
          'useColorScheme()': systemColorScheme,
          'Platform.OS': require('react-native').Platform.OS,
          'Appearance.isDarkColorScheme': currentSystemTheme === 'dark',
          'Current Time': new Date().toISOString(),
          'Appearance object exists': !!Appearance,
          'typeof result': typeof currentSystemTheme,
          'is null?': currentSystemTheme === null,
          'is undefined?': currentSystemTheme === undefined
        });
      }
      
      console.log('System theme detection:', {
        useColorScheme: systemColorScheme,
        Appearance: currentSystemTheme,
        Platform: require('react-native').Platform.OS
      });
      setActualSystemTheme(currentSystemTheme || null);
    } catch (error) {
      console.error('Error loading theme:', error);
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
  }, [themeMode, systemColorScheme, actualSystemTheme, androidThemeOverride]);

  // Helper function to detect Android system theme
  const detectAndroidSystemTheme = useCallback(() => {
    try {
      // Since the Appearance API is broken on Android, we'll use a workaround
      // We'll try to detect by checking if the system is in dark mode
      
      const { Platform } = require('react-native');
      
      if (Platform.OS === 'android') {
        // Method 1: Try to detect by checking system UI
        // This is a workaround for the broken Appearance API
        
        // Check if we can access system settings
        const { NativeModules } = require('react-native');
        
        // Try to access system settings
        if (NativeModules && NativeModules.SettingsManager) {
          try {
            const isDarkMode = NativeModules.SettingsManager.getSystemTheme();
            console.log('SettingsManager result:', isDarkMode);
            return isDarkMode === 'dark' ? 'dark' : 'light';
          } catch (error) {
            console.log('SettingsManager failed:', error);
          }
        }
        
        // Method 2: Try to detect by checking system UI
        // This is a workaround for when native APIs aren't available
        console.log('Using fallback Android system theme detection');
        
        // Method 3: Try to detect by checking if the system is in dark mode
        // We'll use a combination of approaches
        try {
          // Try to detect by checking if the system is in dark mode
          // This is a workaround for the broken Appearance API
          const { Appearance } = require('react-native');
          
          // Force refresh the appearance API
          const currentTheme = Appearance.getColorScheme();
          console.log('Appearance API result:', currentTheme);
          
          // If the Appearance API returns 'light' but we suspect it's wrong,
          // we'll try to detect by checking system UI
          if (currentTheme === 'light') {
            // Try to detect by checking if the system is in dark mode
            // This is a workaround for the broken Appearance API
            console.log('Appearance API returned light, but system might be dark');
            
        // Method 4: Try to detect by checking system UI
        // This is a workaround for when native APIs aren't available
        try {
          // Try to detect by checking if the system is in dark mode
          // This is a workaround for the broken Appearance API
          const { Platform } = require('react-native');
          
          if (Platform.OS === 'android') {
            // Try to detect by checking if the system is in dark mode
            // This is a workaround for the broken Appearance API
            console.log('Trying alternative Android theme detection');
            
            // Method 5: Try to detect by checking system UI
            // This is a workaround for when native APIs aren't available
            try {
              // Try to detect by checking if the system is in dark mode
              // This is a workaround for the broken Appearance API
              const { NativeModules } = require('react-native');
              
              // Try to access system settings
              if (NativeModules && NativeModules.SettingsManager) {
                try {
                  const isDarkMode = NativeModules.SettingsManager.getSystemTheme();
                  console.log('SettingsManager result:', isDarkMode);
                  return isDarkMode === 'dark' ? 'dark' : 'light';
                } catch (error) {
                  console.log('SettingsManager failed:', error);
                }
              }
              
              // For now, we'll return null and let the user manually override
              // In a real app, you might want to implement a native module
              return null;
            } catch (error) {
              console.log('Alternative Android theme detection failed:', error);
              return null;
            }
          }
        } catch (error) {
          console.log('Alternative Android theme detection failed:', error);
          return null;
        }
          }
          
          return currentTheme;
        } catch (error) {
          console.log('Appearance API detection failed:', error);
          return null;
        }
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

  // Enhanced Android theme detection
  const detectAndroidTheme = useCallback(async () => {
    if (require('react-native').Platform.OS !== 'android') return null;
    
    try {
      // Try to use native Android APIs for more accurate detection
      const { NativeModules } = require('react-native');
      
      // Check if we have access to native modules
      if (NativeModules && NativeModules.SystemThemeDetector) {
        const theme = await NativeModules.SystemThemeDetector.getSystemTheme();
        console.log('Native Android theme detection:', theme);
        return theme;
      }
      
      // Fallback: Try to detect based on system UI mode
      // This is a workaround for when native APIs aren't available
      console.log('Using fallback Android theme detection');
      return null;
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
      console.log('🔄 System theme changed:', colorScheme);
      if (require('react-native').Platform.OS === 'android') {
        console.log('🔍 Android Theme Change Debug:', {
          'New colorScheme': colorScheme,
          'Previous actualSystemTheme': actualSystemTheme,
          'Current time': new Date().toISOString(),
          'Appearance.getColorScheme()': Appearance.getColorScheme()
        });
      }
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
    isLoading,
    setTheme: saveTheme,
    toggleTheme,
    refreshSystemTheme,
    actualSystemTheme,
    setAndroidThemeOverride: setAndroidThemeOverrideCallback,
    androidThemeOverride,
  };
};
