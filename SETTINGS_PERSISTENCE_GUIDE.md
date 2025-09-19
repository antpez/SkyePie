# Settings Persistence Guide

This guide explains how your SkyePie app now handles settings persistence across app installs and updates.

## 🎯 **What's New**

Your app now has **enhanced settings persistence** that ensures user settings are:
- ✅ **Saved across app installs** (using AsyncStorage)
- ✅ **Migrated during app updates** (automatic validation)
- ✅ **Backed up and restorable** (export/import functionality)
- ✅ **Validated and error-handled** (robust data integrity)

## 🔧 **How It Works**

### **1. Automatic Initialization**
Settings are automatically loaded when the app starts:
```typescript
// In app initializer
const settings = await settingsPersistenceService.initializeSettings();
```

### **2. Persistent Storage**
Settings are stored using **AsyncStorage** which persists across:
- App restarts
- App updates
- Device reboots
- App uninstalls/reinstalls (on most devices)

### **3. Settings Migration**
When the app updates, settings are automatically:
- Validated for data integrity
- Migrated to new format if needed
- Defaulted for missing fields

## 📱 **Using the New System**

### **In Your Components**
```typescript
import { useSettingsPersistence } from '../hooks/useSettingsPersistence';

function SettingsScreen() {
  const {
    settings,
    isLoading,
    error,
    saveSettings,
    resetSettings,
    exportSettings,
    importSettings,
    hasSettings
  } = useSettingsPersistence();

  // Save settings
  const handleSave = async (newSettings: UserSettings) => {
    try {
      await saveSettings(newSettings);
      console.log('Settings saved!');
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  // Export settings
  const handleExport = async () => {
    try {
      const settingsJson = await exportSettings();
      // Share or save the JSON string
      console.log('Settings exported:', settingsJson);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Import settings
  const handleImport = async (settingsJson: string) => {
    try {
      await importSettings(settingsJson);
      console.log('Settings imported!');
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <View>
      {/* Your settings UI */}
    </View>
  );
}
```

### **Direct Service Usage**
```typescript
import { settingsPersistenceService } from '../services/settingsPersistenceService';

// Load settings
const settings = await settingsPersistenceService.loadSettings();

// Save settings
await settingsPersistenceService.saveSettings(newSettings);

// Create backup
await settingsPersistenceService.createBackup(settings);

// Export settings
const settingsJson = await settingsPersistenceService.exportSettings();

// Import settings
await settingsPersistenceService.importSettings(settingsJson);

// Reset to defaults
await settingsPersistenceService.resetSettings();
```

## 🔄 **Settings Lifecycle**

### **App Startup**
1. **Storage initialized** → AsyncStorage tested
2. **Settings loaded** → From AsyncStorage or defaults created
3. **Settings validated** → Data integrity checked
4. **Settings migrated** → Updated for app version
5. **Backup created** → Current settings backed up

### **Settings Changes**
1. **User changes setting** → UI updates
2. **Settings saved** → AsyncStorage updated
3. **Backup created** → New backup with timestamp
4. **Validation** → Data integrity maintained

### **App Updates**
1. **Settings loaded** → From existing storage
2. **Migration check** → Compare with current version
3. **Validation** → Ensure all fields exist
4. **Migration applied** → Update format if needed
5. **Settings saved** → Updated version stored

## 📊 **Settings Data Structure**

```typescript
interface UserSettings {
  id: string;                    // Unique identifier
  userId: string;                // User identifier
  temperatureUnit: 'celsius' | 'fahrenheit';
  windSpeedUnit: 'kmh' | 'mph' | 'ms';
  rainfallUnit: 'mm' | 'in';
  distanceUnit: 'km' | 'miles';
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  locationAccuracy: 'high' | 'medium' | 'low';
  autoRefreshInterval: number;   // minutes
  showFeelsLike: boolean;
  showHumidity: boolean;
  showWindSpeed: boolean;
  showRainfall: boolean;
  showUVIndex: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🛡️ **Error Handling**

The system includes comprehensive error handling:

### **Storage Errors**
- **AsyncStorage fails** → Fallback to defaults
- **Corrupted data** → Reset to defaults
- **Missing fields** → Migrate and validate

### **Validation Errors**
- **Invalid enum values** → Reset to defaults
- **Missing required fields** → Add defaults
- **Type mismatches** → Convert or default

### **Migration Errors**
- **Version conflicts** → Graceful fallback
- **Data corruption** → Reset to defaults
- **Missing migrations** → Skip and continue

## 🔧 **Advanced Features**

### **Settings Backup**
```typescript
// Automatic backup on every save
await settingsPersistenceService.createBackup(settings);

// Restore from backup
const restoredSettings = await settingsPersistenceService.restoreFromBackup();
```

### **Settings Export/Import**
```typescript
// Export settings (for backup/transfer)
const settingsJson = await settingsPersistenceService.exportSettings();

// Import settings (from backup/transfer)
await settingsPersistenceService.importSettings(settingsJson);
```

### **Settings Info**
```typescript
// Get settings metadata
const info = await settingsPersistenceService.getSettingsInfo();
console.log('Has settings:', info.hasSettings);
console.log('Last updated:', info.lastUpdated);
console.log('Version:', info.version);
```

## 🚀 **Best Practices**

### **1. Always Use the Hook**
```typescript
// ✅ Good - Use the hook
const { settings, saveSettings } = useSettingsPersistence();

// ❌ Avoid - Direct service calls in components
const settings = await settingsPersistenceService.loadSettings();
```

### **2. Handle Loading States**
```typescript
const { settings, isLoading, error } = useSettingsPersistence();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!settings) return <NoSettingsMessage />;
```

### **3. Error Handling**
```typescript
const handleSave = async (newSettings: UserSettings) => {
  try {
    await saveSettings(newSettings);
    showSuccessMessage('Settings saved!');
  } catch (error) {
    showErrorMessage('Failed to save settings');
    console.error('Save error:', error);
  }
};
```

### **4. Settings Validation**
The system automatically validates settings, but you can add custom validation:
```typescript
const validateSettings = (settings: UserSettings): boolean => {
  // Custom validation logic
  return settings.autoRefreshInterval >= 1 && settings.autoRefreshInterval <= 60;
};
```

## 🔍 **Debugging**

### **Check Settings Status**
```typescript
const info = await settingsPersistenceService.getSettingsInfo();
console.log('Settings info:', info);
```

### **Export for Debugging**
```typescript
const settingsJson = await settingsPersistenceService.exportSettings();
console.log('Current settings:', settingsJson);
```

### **Reset if Needed**
```typescript
await settingsPersistenceService.resetSettings();
console.log('Settings reset to defaults');
```

## 📱 **Platform Differences**

### **iOS**
- Settings persist across app updates
- Settings survive device restarts
- Settings may be cleared on app uninstall (iOS behavior)

### **Android**
- Settings persist across app updates
- Settings survive device restarts
- Settings may persist across app uninstalls (device dependent)

## 🎉 **Summary**

Your SkyePie app now has **robust settings persistence** that:

- ✅ **Saves settings across app installs**
- ✅ **Handles app updates gracefully**
- ✅ **Provides backup and restore functionality**
- ✅ **Validates data integrity**
- ✅ **Includes comprehensive error handling**
- ✅ **Offers export/import capabilities**

Users can now:
- **Keep their settings** when reinstalling the app
- **Have settings migrate** during app updates
- **Backup and restore** their settings
- **Export settings** for transfer to other devices

The system is **production-ready** and handles all edge cases gracefully! 🚀
