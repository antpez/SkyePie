import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Switch, Divider, Text, Snackbar, Button } from 'react-native-paper';
import { useThemeContext } from '@/contexts/ThemeContext';
import { UniversalHeader } from '@/components/common';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useUnits } from '@/contexts/UnitsContext';
import { offlineCacheService, userService } from '@/services';

export default function SettingsScreen() {
  const { themeMode, setTheme, effectiveTheme, isLoading, theme } = useThemeContext();
  const { isInitialized: dbInitialized, isInitializing: dbInitializing } = useDatabase();
  const { units, setTemperatureUnit, setWindSpeedUnit, setPressureUnit, setDistanceUnit } = useUnits();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cacheInfo, setCacheInfo] = useState<{
    totalLocations: number;
    favoriteLocations: number;
    cachedWeatherLocations: number;
  } | null>(null);
  const [isLoadingCache, setIsLoadingCache] = useState(false);
  
  // Create description text to avoid template literal issues
  const getThemeDescription = () => {
    if (isLoading) return 'Loading...';
    if (!themeMode) return 'Unknown';
    
    const baseDescription = `Current: ${themeMode}`;
    if (themeMode === 'system' && effectiveTheme) {
      return `${baseDescription} (${effectiveTheme})`;
    }
    return baseDescription;
  };
  
  const themeDescription = getThemeDescription();

  // Helper functions for unit symbols
  const getTemperatureSymbol = () => units.temperature === 'fahrenheit' ? '°F' : '°C';
  const getWindSpeedSymbol = () => {
    switch (units.windSpeed) {
      case 'mph': return 'mph';
      case 'ms': return 'm/s';
      default: return 'km/h';
    }
  };
  const getPressureSymbol = () => {
    switch (units.pressure) {
      case 'mb': return 'mb';
      case 'in': return 'inHg';
      default: return 'hPa';
    }
  };

  const handleThemeChange = useCallback(async (newTheme: 'light' | 'dark' | 'system') => {
    if (!isLoading) {
      try {
        await setTheme(newTheme);
        setError(null);
        setSuccessMessage(`Theme changed to ${newTheme}`);
        setSnackbarVisible(true);
      } catch (error) {
        console.error('Error changing theme:', error);
        setError('Failed to change theme. Please try again.');
        setSnackbarVisible(true);
      }
    }
  }, [setTheme, isLoading]);

  const handleTemperatureUnitChange = useCallback(async () => {
    try {
      const newUnit = units.temperature === 'celsius' ? 'fahrenheit' : 'celsius';
      await setTemperatureUnit(newUnit);
      setError(null);
      setSuccessMessage(`Temperature unit changed to ${newUnit}`);
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error changing temperature unit:', error);
      setError('Failed to change temperature unit. Please try again.');
      setSnackbarVisible(true);
    }
  }, [units.temperature, setTemperatureUnit]);

  const handleWindSpeedUnitChange = useCallback(async () => {
    try {
      const windUnits = ['kmh', 'mph', 'ms'] as const;
      const currentIndex = windUnits.indexOf(units.windSpeed);
      const nextIndex = (currentIndex + 1) % windUnits.length;
      const newUnit = windUnits[nextIndex];
      await setWindSpeedUnit(newUnit);
      setError(null);
      setSuccessMessage(`Wind speed unit changed to ${newUnit}`);
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error changing wind speed unit:', error);
      setError('Failed to change wind speed unit. Please try again.');
      setSnackbarVisible(true);
    }
  }, [units.windSpeed, setWindSpeedUnit]);

  const handlePressureUnitChange = useCallback(async () => {
    try {
      const pressureUnits = ['hpa', 'mb', 'in'] as const;
      const currentIndex = pressureUnits.indexOf(units.pressure);
      const nextIndex = (currentIndex + 1) % pressureUnits.length;
      const newUnit = pressureUnits[nextIndex];
      await setPressureUnit(newUnit);
      setError(null);
      setSuccessMessage(`Pressure unit changed to ${newUnit}`);
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error changing pressure unit:', error);
      setError('Failed to change pressure unit. Please try again.');
      setSnackbarVisible(true);
    }
  }, [units.pressure, setPressureUnit]);

  const loadCacheInfo = useCallback(async () => {
    if (!dbInitialized) return;
    
    try {
      setIsLoadingCache(true);
      const user = await userService.getCurrentUser();
      const info = await offlineCacheService.getCacheInfo(user.id);
      setCacheInfo(info);
    } catch (error) {
      console.error('Error loading cache info:', error);
    } finally {
      setIsLoadingCache(false);
    }
  }, [dbInitialized]);

  const clearExpiredCache = useCallback(async () => {
    try {
      await offlineCacheService.clearExpiredCache();
      await loadCacheInfo();
      setError(null);
      setSuccessMessage('Expired cache cleared successfully');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error clearing expired cache:', error);
      setError('Failed to clear cache. Please try again.');
      setSnackbarVisible(true);
    }
  }, [loadCacheInfo]);

  // Load cache info on mount
  useEffect(() => {
    loadCacheInfo();
  }, [loadCacheInfo]);

  // Memoized values for performance
  const containerStyle = useMemo(() => [
    styles.container, 
    { backgroundColor: theme.colors.background }
  ], [theme.colors.background, effectiveTheme]);
  
  
  const sectionTitleStyle = useMemo(() => [
    styles.sectionTitle,
    { color: theme.colors.onSurface }
  ], [theme.colors.onSurface, effectiveTheme]);
  
  const selectedThemeTextStyle = useMemo(() => [
    styles.selectedThemeText,
    { color: theme.colors.primary }
  ], [theme.colors.primary, effectiveTheme]);

  const selectedThemeStyle = useMemo(() => [
    styles.selectedTheme,
    { 
      backgroundColor: theme.colors.primary + '15',
      borderColor: theme.colors.primary + '30'
    }
  ], [theme.colors.primary, effectiveTheme]);

  return (
    <View style={containerStyle} key={`settings-${effectiveTheme}-${themeMode}`}>
      {/* Universal Header */}
      <UniversalHeader 
        title="Settings" 
        backgroundColor={theme.colors.background}
        textColor={theme.colors.onSurface}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
      <View style={styles.firstSectionContainer}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Appearance
        </Text>
        
        <View style={styles.themeSection}>
          <List.Item
            title="Theme"
            description={themeDescription}
            left={(props) => <List.Icon {...props} icon="theme-light-dark" color={theme.colors.primary} />}
            titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
            descriptionStyle={[styles.listItemDescription, { color: theme.colors.onSurfaceVariant }]}
            style={styles.listItem}
          />
          
          <View style={styles.themeOptionsContainer}>
            <View style={[styles.themeOption, themeMode === 'light' && selectedThemeStyle]}>
              <List.Item
                title="Light"
                onPress={() => handleThemeChange('light')}
                disabled={isLoading}
                titleStyle={[
                  styles.themeOptionText,
                  { color: theme.colors.onSurface },
                  themeMode === 'light' && selectedThemeTextStyle,
                  isLoading && styles.disabledText
                ]}
                left={(props) => (
                  <List.Icon 
                    {...props} 
                    icon="weather-sunny" 
                    color={themeMode === 'light' ? theme.colors.primary : theme.colors.onSurfaceVariant} 
                  />
                )}
                style={styles.themeOptionItem}
              />
            </View>
            <View style={[styles.themeOption, themeMode === 'dark' && selectedThemeStyle]}>
              <List.Item
                title="Dark"
                onPress={() => handleThemeChange('dark')}
                disabled={isLoading}
                titleStyle={[
                  styles.themeOptionText,
                  { color: theme.colors.onSurface },
                  themeMode === 'dark' && selectedThemeTextStyle,
                  isLoading && styles.disabledText
                ]}
                left={(props) => (
                  <List.Icon 
                    {...props} 
                    icon="weather-night" 
                    color={themeMode === 'dark' ? theme.colors.primary : theme.colors.onSurfaceVariant} 
                  />
                )}
                style={styles.themeOptionItem}
              />
            </View>
            <View style={[styles.themeOption, themeMode === 'system' && selectedThemeStyle]}>
              <List.Item
                title="System"
                onPress={() => handleThemeChange('system')}
                disabled={isLoading}
                titleStyle={[
                  styles.themeOptionText,
                  { color: theme.colors.onSurface },
                  themeMode === 'system' && selectedThemeTextStyle,
                  isLoading && styles.disabledText
                ]}
                left={(props) => (
                  <List.Icon 
                    {...props} 
                    icon="cog" 
                    color={themeMode === 'system' ? theme.colors.primary : theme.colors.onSurfaceVariant} 
                  />
                )}
                style={styles.themeOptionItem}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Weather Units Section */}
      <View style={styles.sectionContainer}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Weather Units
        </Text>
        
        <View style={styles.unitsContainer}>
          <View style={styles.unitItem}>
            <List.Item
              title="Temperature"
              description="Celsius or Fahrenheit"
              left={(props) => <List.Icon {...props} icon="thermometer" color={theme.colors.primary} />}
              right={() => (
                <View style={styles.unitValueContainer}>
                  <Text style={[styles.unitValue, { color: theme.colors.primary }]}>{getTemperatureSymbol()}</Text>
                </View>
              )}
              onPress={handleTemperatureUnitChange}
              titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
              descriptionStyle={[styles.listItemDescription, { color: theme.colors.onSurfaceVariant }]}
              style={styles.listItem}
            />
          </View>
          
          <View style={styles.unitItem}>
            <List.Item
              title="Wind Speed"
              description="km/h, mph, or m/s"
              left={(props) => <List.Icon {...props} icon="weather-windy" color={theme.colors.primary} />}
              right={() => (
                <View style={styles.unitValueContainer}>
                  <Text style={[styles.unitValue, { color: theme.colors.primary }]}>{getWindSpeedSymbol()}</Text>
                </View>
              )}
              onPress={handleWindSpeedUnitChange}
              titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
              descriptionStyle={[styles.listItemDescription, { color: theme.colors.onSurfaceVariant }]}
              style={styles.listItem}
            />
          </View>
          
          <View style={styles.unitItem}>
            <List.Item
              title="Pressure"
              description="hPa, inHg, or mb"
              left={(props) => <List.Icon {...props} icon="gauge" color={theme.colors.primary} />}
              right={() => (
                <View style={styles.unitValueContainer}>
                  <Text style={[styles.unitValue, { color: theme.colors.primary }]}>{getPressureSymbol()}</Text>
                </View>
              )}
              onPress={handlePressureUnitChange}
              titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
              descriptionStyle={[styles.listItemDescription, { color: theme.colors.onSurfaceVariant }]}
              style={styles.listItem}
            />
          </View>
        </View>
      </View>

      {/* Display Options Section */}
      <View style={styles.sectionContainer}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Display Options
        </Text>
        
        <View style={styles.displayOptionsContainer}>
          <View style={styles.displayOptionItem}>
            <List.Item
              title="Show Feels Like"
              description="Display feels like temperature"
              left={(props) => <List.Icon {...props} icon="thermometer-lines" color={theme.colors.primary} />}
              right={() => (
                <Switch 
                  value={true} 
                  color={theme.colors.primary}
                  trackColor={{ false: theme.colors.outline, true: theme.colors.primary + '40' }}
                  thumbColor={theme.colors.primary}
                />
              )}
              titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
              descriptionStyle={[styles.listItemDescription, { color: theme.colors.onSurfaceVariant }]}
              style={styles.listItem}
            />
          </View>
          
          <View style={styles.displayOptionItem}>
            <List.Item
              title="Show Humidity"
              description="Display humidity percentage"
              left={(props) => <List.Icon {...props} icon="water" color={theme.colors.primary} />}
              right={() => (
                <Switch 
                  value={true} 
                  color={theme.colors.primary}
                  trackColor={{ false: theme.colors.outline, true: theme.colors.primary + '40' }}
                  thumbColor={theme.colors.primary}
                />
              )}
              titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
              descriptionStyle={[styles.listItemDescription, { color: theme.colors.onSurfaceVariant }]}
              style={styles.listItem}
            />
          </View>
          
          <View style={styles.displayOptionItem}>
            <List.Item
              title="Show Wind Speed"
              description="Display wind speed and direction"
              left={(props) => <List.Icon {...props} icon="weather-windy" color={theme.colors.primary} />}
              right={() => (
                <Switch 
                  value={true} 
                  color={theme.colors.primary}
                  trackColor={{ false: theme.colors.outline, true: theme.colors.primary + '40' }}
                  thumbColor={theme.colors.primary}
                />
              )}
              titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
              descriptionStyle={[styles.listItemDescription, { color: theme.colors.onSurfaceVariant }]}
              style={styles.listItem}
            />
          </View>
          
          <View style={styles.displayOptionItem}>
            <List.Item
              title="Show Pressure"
              description="Display atmospheric pressure"
              left={(props) => <List.Icon {...props} icon="gauge" color={theme.colors.primary} />}
              right={() => (
                <Switch 
                  value={false} 
                  color={theme.colors.primary}
                  trackColor={{ false: theme.colors.outline, true: theme.colors.primary + '40' }}
                  thumbColor={theme.colors.primary}
                />
              )}
              titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
              descriptionStyle={[styles.listItemDescription, { color: theme.colors.onSurfaceVariant }]}
              style={styles.listItem}
            />
          </View>
        </View>
      </View>

      {/* Notifications temporarily unavailable (requires paid subscription) */}

      {/* Cache Management Section */}
      <View style={styles.sectionContainer}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Cache Management
        </Text>
        
        {cacheInfo && (
          <View style={styles.cacheInfoContainer}>
            <View style={styles.cacheInfoRow}>
              <Text variant="labelMedium" style={[styles.cacheInfoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Total Locations
              </Text>
              <Text variant="titleMedium" style={[styles.cacheInfoValue, { color: theme.colors.onSurface }]}>
                {cacheInfo.totalLocations}
              </Text>
            </View>
            <View style={styles.cacheInfoRow}>
              <Text variant="labelMedium" style={[styles.cacheInfoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Favorite Locations
              </Text>
              <Text variant="titleMedium" style={[styles.cacheInfoValue, { color: theme.colors.onSurface }]}>
                {cacheInfo.favoriteLocations}
              </Text>
            </View>
            <View style={styles.cacheInfoRow}>
              <Text variant="labelMedium" style={[styles.cacheInfoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Cached Weather
              </Text>
              <Text variant="titleMedium" style={[styles.cacheInfoValue, { color: theme.colors.onSurface }]}>
                {cacheInfo.cachedWeatherLocations}
              </Text>
            </View>
          </View>
        )}
        
        <Button
          mode="outlined"
          onPress={clearExpiredCache}
          loading={isLoadingCache}
          disabled={isLoadingCache}
          style={[styles.cacheButton, { borderColor: theme.colors.primary }]}
          labelStyle={{ color: theme.colors.primary }}
        >
          Clear Expired Cache
        </Button>
      </View>

      {/* About Section */}
      <View style={styles.sectionContainer}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          About
        </Text>
        
        <View style={styles.aboutContainer}>
          <View style={styles.aboutItem}>
            <List.Item
              title="Version"
              description="1.0.0"
              left={(props) => <List.Icon {...props} icon="information" color={theme.colors.primary} />}
              titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
              descriptionStyle={[styles.listItemDescription, { color: theme.colors.onSurfaceVariant }]}
              style={styles.listItem}
            />
          </View>
          
          <View style={styles.aboutItem}>
            <List.Item
              title="Weather Data"
              description="Powered by OpenWeatherMap"
              left={(props) => <List.Icon {...props} icon="cloud" color={theme.colors.primary} />}
              titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
              descriptionStyle={[styles.listItemDescription, { color: theme.colors.onSurfaceVariant }]}
              style={styles.listItem}
            />
          </View>
        </View>
      </View>
      </ScrollView>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          setSnackbarVisible(false);
          setError(null);
          setSuccessMessage(null);
        }}
        duration={3000}
        style={error ? { backgroundColor: theme.colors.error } : { backgroundColor: theme.colors.primary }}
      >
        {error || successMessage || 'Settings updated'}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100, // Space for UniversalHeader
  },
  // Add spacing between header and first section
  firstSectionContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    marginTop: 40, // Add 40px spacing to match index.tsx
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Section containers
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
    fontSize: 20,
  },
  // Theme section
  themeSection: {
    marginTop: 12,
  },
  themeOptionsContainer: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 12,
  },
  themeOption: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  themeOptionItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'left',
  },
  listItem: {
    paddingVertical: 4,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listItemDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  selectedTheme: {
    borderWidth: 1,
  },
  selectedThemeText: {
    fontWeight: 'bold',
  },
  disabledOption: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
  // Units section
  unitsContainer: {
    gap: 12,
  },
  unitItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  // Unit value display
  unitValueContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  unitValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Display options section
  displayOptionsContainer: {
    gap: 12,
  },
  displayOptionItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  // Cache info
  cacheInfoContainer: {
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
  },
  cacheInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cacheInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  cacheInfoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  cacheButton: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  // About section
  aboutContainer: {
    gap: 12,
  },
  aboutItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});
