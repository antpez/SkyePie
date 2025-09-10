import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Switch, Divider, Text, Card, Snackbar, Button } from 'react-native-paper';
import { ConsistentCard } from '../../src/components/common';
import { useThemeContext } from '../../src/contexts/ThemeContext';
import { useDatabase } from '../../src/contexts/DatabaseContext';
import { useUnits } from '../../src/contexts/UnitsContext';
import { offlineCacheService, userService } from '../../src/services';

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
    <ScrollView style={containerStyle} key={`settings-${effectiveTheme}-${themeMode}`}>
      <ConsistentCard>
        <Card.Content>
          <Text variant="titleLarge" style={sectionTitleStyle}>
            Appearance
          </Text>
          
          <List.Item
            title="Theme"
            description={themeDescription}
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <View style={styles.themeOptions}>
                <List.Item
                  title="Light"
                  onPress={() => handleThemeChange('light')}
                  disabled={isLoading}
                  style={[
                    styles.themeOption,
                    themeMode === 'light' && selectedThemeStyle,
                    isLoading && styles.disabledOption
                  ]}
                  titleStyle={[
                    styles.themeOptionText,
                    { color: theme.colors.onSurface },
                    themeMode === 'light' && selectedThemeTextStyle,
                    isLoading && styles.disabledText
                  ]}
                />
                <List.Item
                  title="Dark"
                  onPress={() => handleThemeChange('dark')}
                  disabled={isLoading}
                  style={[
                    styles.themeOption,
                    themeMode === 'dark' && selectedThemeStyle,
                    isLoading && styles.disabledOption
                  ]}
                  titleStyle={[
                    styles.themeOptionText,
                    { color: theme.colors.onSurface },
                    themeMode === 'dark' && selectedThemeTextStyle,
                    isLoading && styles.disabledText
                  ]}
                />
                <List.Item
                  title="System"
                  onPress={() => handleThemeChange('system')}
                  disabled={isLoading}
                  style={[
                    styles.themeOption,
                    themeMode === 'system' && selectedThemeStyle,
                    isLoading && styles.disabledOption
                  ]}
                  titleStyle={[
                    styles.themeOptionText,
                    { color: theme.colors.onSurface },
                    themeMode === 'system' && selectedThemeTextStyle,
                    isLoading && styles.disabledText
                  ]}
                />
              </View>
            )}
          />
        </Card.Content>
      </ConsistentCard>

      <ConsistentCard>
        <Card.Content>
          <Text variant="titleLarge" style={sectionTitleStyle}>
            Weather Units
          </Text>
          
          <List.Item
            title="Temperature"
            description="Celsius or Fahrenheit"
            left={(props) => <List.Icon {...props} icon="thermometer" />}
            right={() => <Text style={{ color: theme.colors.onSurface }}>{getTemperatureSymbol()}</Text>}
            onPress={handleTemperatureUnitChange}
          />
          
          <Divider />
          
          <List.Item
            title="Wind Speed"
            description="km/h, mph, or m/s"
            left={(props) => <List.Icon {...props} icon="weather-windy" />}
            right={() => <Text style={{ color: theme.colors.onSurface }}>{getWindSpeedSymbol()}</Text>}
            onPress={handleWindSpeedUnitChange}
          />
          
          <Divider />
          
          <List.Item
            title="Pressure"
            description="hPa, inHg, or mb"
            left={(props) => <List.Icon {...props} icon="gauge" />}
            right={() => <Text style={{ color: theme.colors.onSurface }}>{getPressureSymbol()}</Text>}
            onPress={handlePressureUnitChange}
          />
        </Card.Content>
      </ConsistentCard>

      <ConsistentCard>
        <Card.Content>
          <Text variant="titleLarge" style={sectionTitleStyle}>
            Display Options
          </Text>
          
          <List.Item
            title="Show Feels Like"
            description="Display feels like temperature"
            left={(props) => <List.Icon {...props} icon="thermometer-lines" />}
            right={() => <Switch value={true} />}
          />
          
          <Divider />
          
          <List.Item
            title="Show Humidity"
            description="Display humidity percentage"
            left={(props) => <List.Icon {...props} icon="water" />}
            right={() => <Switch value={true} />}
          />
          
          <Divider />
          
          <List.Item
            title="Show Wind Speed"
            description="Display wind speed and direction"
            left={(props) => <List.Icon {...props} icon="weather-windy" />}
            right={() => <Switch value={true} />}
          />
          
          <Divider />
          
          <List.Item
            title="Show Pressure"
            description="Display atmospheric pressure"
            left={(props) => <List.Icon {...props} icon="gauge" />}
            right={() => <Switch value={false} />}
          />
        </Card.Content>
      </ConsistentCard>

      {/* Notifications temporarily unavailable (requires paid subscription) */}

      <ConsistentCard>
        <Card.Content>
          <Text variant="titleLarge" style={sectionTitleStyle}>
            Cache Management
          </Text>
          
          {cacheInfo && (
            <View style={styles.cacheInfoContainer}>
              <Text variant="bodyMedium" style={[styles.cacheInfoText, { color: theme.colors.onSurface }]}>
                Total Locations: {cacheInfo.totalLocations}
              </Text>
              <Text variant="bodyMedium" style={[styles.cacheInfoText, { color: theme.colors.onSurface }]}>
                Favorite Locations: {cacheInfo.favoriteLocations}
              </Text>
              <Text variant="bodyMedium" style={[styles.cacheInfoText, { color: theme.colors.onSurface }]}>
                Cached Weather: {cacheInfo.cachedWeatherLocations}
              </Text>
            </View>
          )}
          
          <Button
            mode="outlined"
            onPress={clearExpiredCache}
            loading={isLoadingCache}
            disabled={isLoadingCache}
            style={styles.cacheButton}
          >
            Clear Expired Cache
          </Button>
        </Card.Content>
      </ConsistentCard>

      <ConsistentCard>
        <Card.Content>
          <Text variant="titleLarge" style={sectionTitleStyle}>
            About
          </Text>
          
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          
          <Divider />
          
          <List.Item
            title="Weather Data"
            description="Powered by OpenWeatherMap"
            left={(props) => <List.Icon {...props} icon="cloud" />}
          />
        </Card.Content>
      </ConsistentCard>
      
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  themeOptions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
    minWidth: 60,
    alignItems: 'center',
  },
  themeOptionText: {
    fontSize: 12,
    fontWeight: '500',
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
  cacheInfoContainer: {
    marginVertical: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  cacheInfoText: {
    marginBottom: 4,
  },
  cacheButton: {
    marginTop: 8,
  },
});
