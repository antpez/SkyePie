import { storageService } from './storageService';
import { UserSettings } from '../types/user';
import { STORAGE_KEYS } from '../utils/constants';

export interface SettingsBackup {
  version: string;
  timestamp: number;
  settings: UserSettings;
  metadata: {
    appVersion: string;
    platform: 'ios' | 'android';
    deviceId: string;
  };
}

export class SettingsPersistenceService {
  private static instance: SettingsPersistenceService;
  private readonly SETTINGS_VERSION = '1.0.0';
  private readonly BACKUP_KEY = 'settings_backup';

  static getInstance(): SettingsPersistenceService {
    if (!SettingsPersistenceService.instance) {
      SettingsPersistenceService.instance = new SettingsPersistenceService();
    }
    return SettingsPersistenceService.instance;
  }

  /**
   * Initialize settings on app startup
   * This ensures settings are loaded and available immediately
   */
  async initializeSettings(): Promise<UserSettings> {
    try {
      console.log('🔄 Initializing settings persistence...');
      
      // Try to load existing settings
      let settings = await this.loadSettings();
      
      if (!settings) {
        console.log('📝 No existing settings found, creating defaults...');
        settings = this.createDefaultSettings();
        await this.saveSettings(settings);
      } else {
        console.log('✅ Settings loaded successfully');
        // Validate and migrate settings if needed
        settings = await this.validateAndMigrateSettings(settings);
      }

      // Create backup
      await this.createBackup(settings);
      
      console.log('✅ Settings persistence initialized');
      return settings;
    } catch (error) {
      console.error('❌ Settings initialization failed:', error);
      // Return default settings as fallback
      return this.createDefaultSettings();
    }
  }

  /**
   * Load settings from storage
   */
  async loadSettings(): Promise<UserSettings | null> {
    try {
      const settings = await storageService.getUserSettings();
      return settings;
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
      return null;
    }
  }

  /**
   * Save settings to storage
   */
  async saveSettings(settings: UserSettings): Promise<void> {
    try {
      // Update timestamp
      settings.updatedAt = new Date();
      
      // Save to storage
      await storageService.saveUserSettings(settings);
      
      // Create backup
      await this.createBackup(settings);
      
      console.log('✅ Settings saved successfully');
    } catch (error) {
      console.error('❌ Failed to save settings:', error);
      throw error;
    }
  }

  /**
   * Create default settings
   */
  private createDefaultSettings(): UserSettings {
    return {
      id: this.generateId(),
      userId: this.generateId(),
      temperatureUnit: 'celsius',
      windSpeedUnit: 'kmh',
      rainfallUnit: 'mm',
      distanceUnit: 'km',
      theme: 'system',
      notificationsEnabled: true,
      locationAccuracy: 'high',
      autoRefreshInterval: 15,
      showFeelsLike: true,
      showHumidity: true,
      showWindSpeed: true,
      showRainfall: true,
      showUVIndex: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Validate and migrate settings if needed
   */
  private async validateAndMigrateSettings(settings: UserSettings): Promise<UserSettings> {
    const migratedSettings = { ...settings };

    // Ensure all required fields exist
    if (!migratedSettings.id) {
      migratedSettings.id = this.generateId();
    }
    if (!migratedSettings.userId) {
      migratedSettings.userId = this.generateId();
    }
    if (!migratedSettings.createdAt) {
      migratedSettings.createdAt = new Date();
    }
    if (!migratedSettings.updatedAt) {
      migratedSettings.updatedAt = new Date();
    }

    // Validate enum values
    if (!['celsius', 'fahrenheit'].includes(migratedSettings.temperatureUnit)) {
      migratedSettings.temperatureUnit = 'celsius';
    }
    if (!['kmh', 'mph', 'ms'].includes(migratedSettings.windSpeedUnit)) {
      migratedSettings.windSpeedUnit = 'kmh';
    }
    if (!['mm', 'in'].includes(migratedSettings.rainfallUnit)) {
      migratedSettings.rainfallUnit = 'mm';
    }
    if (!['km', 'miles'].includes(migratedSettings.distanceUnit)) {
      migratedSettings.distanceUnit = 'km';
    }
    if (!['light', 'dark', 'system'].includes(migratedSettings.theme)) {
      migratedSettings.theme = 'system';
    }
    if (!['high', 'medium', 'low'].includes(migratedSettings.locationAccuracy)) {
      migratedSettings.locationAccuracy = 'high';
    }

    // Validate numeric values
    if (typeof migratedSettings.autoRefreshInterval !== 'number' || migratedSettings.autoRefreshInterval < 1) {
      migratedSettings.autoRefreshInterval = 15;
    }

    // Validate boolean values
    const booleanFields: (keyof UserSettings)[] = [
      'notificationsEnabled', 'showFeelsLike', 'showHumidity', 
      'showWindSpeed', 'showRainfall', 'showUVIndex'
    ];
    
    booleanFields.forEach(field => {
      if (typeof migratedSettings[field] !== 'boolean') {
        (migratedSettings as any)[field] = true;
      }
    });

    // If settings were migrated, save them
    if (JSON.stringify(migratedSettings) !== JSON.stringify(settings)) {
      console.log('🔄 Settings migrated, saving updated version...');
      await this.saveSettings(migratedSettings);
    }

    return migratedSettings;
  }

  /**
   * Create a backup of current settings
   */
  async createBackup(settings: UserSettings): Promise<void> {
    try {
      const backup: SettingsBackup = {
        version: this.SETTINGS_VERSION,
        timestamp: Date.now(),
        settings,
        metadata: {
          appVersion: '1.0.0', // You can get this from app config
          platform: 'android', // You can detect this dynamically
          deviceId: this.generateId(),
        },
      };

      await storageService.setItem(this.BACKUP_KEY, backup);
      console.log('✅ Settings backup created');
    } catch (error) {
      console.warn('⚠️ Failed to create settings backup:', error);
    }
  }

  /**
   * Restore settings from backup
   */
  async restoreFromBackup(): Promise<UserSettings | null> {
    try {
      const backup = await storageService.getItem<SettingsBackup>(this.BACKUP_KEY);
      if (backup && backup.settings) {
        console.log('✅ Settings restored from backup');
        return backup.settings;
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to restore from backup:', error);
      return null;
    }
  }

  /**
   * Export settings for backup/transfer
   */
  async exportSettings(): Promise<string> {
    try {
      const settings = await this.loadSettings();
      if (!settings) {
        throw new Error('No settings to export');
      }

      const exportData = {
        version: this.SETTINGS_VERSION,
        timestamp: Date.now(),
        settings,
        metadata: {
          appVersion: '1.0.0',
          platform: 'android',
        },
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('❌ Failed to export settings:', error);
      throw error;
    }
  }

  /**
   * Import settings from backup/transfer
   */
  async importSettings(settingsJson: string): Promise<void> {
    try {
      const importData = JSON.parse(settingsJson);
      
      if (!importData.settings) {
        throw new Error('Invalid settings format');
      }

      const settings = await this.validateAndMigrateSettings(importData.settings);
      await this.saveSettings(settings);
      
      console.log('✅ Settings imported successfully');
    } catch (error) {
      console.error('❌ Failed to import settings:', error);
      throw error;
    }
  }

  /**
   * Clear all settings and reset to defaults
   */
  async resetSettings(): Promise<void> {
    try {
      const defaultSettings = this.createDefaultSettings();
      await this.saveSettings(defaultSettings);
      console.log('✅ Settings reset to defaults');
    } catch (error) {
      console.error('❌ Failed to reset settings:', error);
      throw error;
    }
  }

  /**
   * Check if settings exist
   */
  async hasSettings(): Promise<boolean> {
    try {
      const settings = await this.loadSettings();
      return settings !== null;
    } catch (error) {
      console.error('❌ Failed to check settings existence:', error);
      return false;
    }
  }

  /**
   * Get settings info for debugging
   */
  async getSettingsInfo(): Promise<{
    hasSettings: boolean;
    lastUpdated: Date | null;
    version: string;
  }> {
    try {
      const settings = await this.loadSettings();
      return {
        hasSettings: settings !== null,
        lastUpdated: settings?.updatedAt || null,
        version: this.SETTINGS_VERSION,
      };
    } catch (error) {
      console.error('❌ Failed to get settings info:', error);
      return {
        hasSettings: false,
        lastUpdated: null,
        version: this.SETTINGS_VERSION,
      };
    }
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const settingsPersistenceService = SettingsPersistenceService.getInstance();
