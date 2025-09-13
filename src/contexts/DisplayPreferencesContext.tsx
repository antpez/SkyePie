import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { DisplayPreferences } from '../types/user';
import { storageService } from '../services';

const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  showFeelsLike: true,
  showHumidity: true,
  showWindSpeed: true,
  showPressure: false,
  showUVIndex: false,
  showSunriseSunset: true,
};

interface DisplayPreferencesContextType {
  preferences: DisplayPreferences;
  setShowFeelsLike: (show: boolean) => Promise<void>;
  setShowHumidity: (show: boolean) => Promise<void>;
  setShowWindSpeed: (show: boolean) => Promise<void>;
  setShowPressure: (show: boolean) => Promise<void>;
  setShowUVIndex: (show: boolean) => Promise<void>;
  setShowSunriseSunset: (show: boolean) => Promise<void>;
  setPreferences: (preferences: DisplayPreferences) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  isLoading: boolean;
}

const DisplayPreferencesContext = createContext<DisplayPreferencesContextType | undefined>(undefined);

interface DisplayPreferencesProviderProps {
  children: ReactNode;
}

export function DisplayPreferencesProvider({ children }: DisplayPreferencesProviderProps) {
  const [preferences, setPreferencesState] = useState<DisplayPreferences>(DEFAULT_DISPLAY_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from storage
  const loadPreferences = useCallback(async () => {
    try {
      const savedPreferences = await storageService.getItem<DisplayPreferences>('display_preferences');
      if (savedPreferences) {
        setPreferencesState(savedPreferences);
      }
    } catch (error) {
      console.error('Error loading display preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save preferences to storage
  const savePreferences = useCallback(async (newPreferences: DisplayPreferences) => {
    try {
      await storageService.setItem('display_preferences', newPreferences);
      setPreferencesState(newPreferences);
    } catch (error) {
      console.error('Error saving display preferences:', error);
      throw error;
    }
  }, []);

  // Set show feels like
  const setShowFeelsLike = useCallback(async (show: boolean) => {
    const newPreferences = { ...preferences, showFeelsLike: show };
    await savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  // Set show humidity
  const setShowHumidity = useCallback(async (show: boolean) => {
    const newPreferences = { ...preferences, showHumidity: show };
    await savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  // Set show wind speed
  const setShowWindSpeed = useCallback(async (show: boolean) => {
    const newPreferences = { ...preferences, showWindSpeed: show };
    await savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  // Set show pressure
  const setShowPressure = useCallback(async (show: boolean) => {
    const newPreferences = { ...preferences, showPressure: show };
    await savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  // Set show UV index
  const setShowUVIndex = useCallback(async (show: boolean) => {
    const newPreferences = { ...preferences, showUVIndex: show };
    await savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  // Set show sunrise/sunset
  const setShowSunriseSunset = useCallback(async (show: boolean) => {
    const newPreferences = { ...preferences, showSunriseSunset: show };
    await savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  // Set all preferences
  const setPreferences = useCallback(async (newPreferences: DisplayPreferences) => {
    await savePreferences(newPreferences);
  }, [savePreferences]);

  // Reset to default preferences
  const resetToDefaults = useCallback(async () => {
    await savePreferences(DEFAULT_DISPLAY_PREFERENCES);
  }, [savePreferences]);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const value: DisplayPreferencesContextType = {
    preferences,
    setShowFeelsLike,
    setShowHumidity,
    setShowWindSpeed,
    setShowPressure,
    setShowUVIndex,
    setShowSunriseSunset,
    setPreferences,
    resetToDefaults,
    isLoading,
  };

  return (
    <DisplayPreferencesContext.Provider value={value}>
      {children}
    </DisplayPreferencesContext.Provider>
  );
}

export function useDisplayPreferences(): DisplayPreferencesContextType {
  const context = useContext(DisplayPreferencesContext);
  if (context === undefined) {
    throw new Error('useDisplayPreferences must be used within a DisplayPreferencesProvider');
  }
  return context;
}
