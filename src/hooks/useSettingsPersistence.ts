import { useState, useEffect, useCallback } from 'react';
import { UserSettings } from '../types/user';
import { settingsPersistenceService } from '../services/settingsPersistenceService';

export interface UseSettingsPersistenceReturn {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  saveSettings: (settings: UserSettings) => Promise<void>;
  loadSettings: () => Promise<void>;
  resetSettings: () => Promise<void>;
  exportSettings: () => Promise<string>;
  importSettings: (settingsJson: string) => Promise<void>;
  hasSettings: boolean;
  settingsInfo: {
    hasSettings: boolean;
    lastUpdated: Date | null;
    version: string;
  } | null;
}

export const useSettingsPersistence = (): UseSettingsPersistenceReturn => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsInfo, setSettingsInfo] = useState<{
    hasSettings: boolean;
    lastUpdated: Date | null;
    version: string;
  } | null>(null);

  // Load settings on mount
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const loadedSettings = await settingsPersistenceService.loadSettings();
      setSettings(loadedSettings);
      
      // Get settings info
      const info = await settingsPersistenceService.getSettingsInfo();
      setSettingsInfo(info);
      
      console.log('✅ Settings loaded successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load settings';
      console.error('❌ Failed to load settings:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save settings
  const saveSettings = useCallback(async (newSettings: UserSettings) => {
    try {
      setError(null);
      
      await settingsPersistenceService.saveSettings(newSettings);
      setSettings(newSettings);
      
      // Update settings info
      const info = await settingsPersistenceService.getSettingsInfo();
      setSettingsInfo(info);
      
      console.log('✅ Settings saved successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      console.error('❌ Failed to save settings:', errorMessage);
      setError(errorMessage);
      throw err; // Re-throw so calling code can handle it
    }
  }, []);

  // Reset settings to defaults
  const resetSettings = useCallback(async () => {
    try {
      setError(null);
      
      await settingsPersistenceService.resetSettings();
      const defaultSettings = await settingsPersistenceService.loadSettings();
      setSettings(defaultSettings);
      
      // Update settings info
      const info = await settingsPersistenceService.getSettingsInfo();
      setSettingsInfo(info);
      
      console.log('✅ Settings reset to defaults');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset settings';
      console.error('❌ Failed to reset settings:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Export settings
  const exportSettings = useCallback(async (): Promise<string> => {
    try {
      setError(null);
      const exported = await settingsPersistenceService.exportSettings();
      console.log('✅ Settings exported successfully');
      return exported;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export settings';
      console.error('❌ Failed to export settings:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Import settings
  const importSettings = useCallback(async (settingsJson: string) => {
    try {
      setError(null);
      
      await settingsPersistenceService.importSettings(settingsJson);
      const importedSettings = await settingsPersistenceService.loadSettings();
      setSettings(importedSettings);
      
      // Update settings info
      const info = await settingsPersistenceService.getSettingsInfo();
      setSettingsInfo(info);
      
      console.log('✅ Settings imported successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import settings';
      console.error('❌ Failed to import settings:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Check if settings exist
  const hasSettings = settings !== null;

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    isLoading,
    error,
    saveSettings,
    loadSettings,
    resetSettings,
    exportSettings,
    importSettings,
    hasSettings,
    settingsInfo,
  };
};
