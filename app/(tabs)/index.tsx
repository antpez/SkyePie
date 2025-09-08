import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, FAB, Snackbar } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { WeatherCard, ForecastRow, LoadingSpinner } from '../../src/components';
import { useLocation, useWeather } from '../../src/hooks';
import { useThemeContext } from '../../src/contexts/ThemeContext';
import { LocationCoordinates } from '../../src/types';
import { APP_CONFIG } from '../../src/config/app';

export default function WeatherScreen() {
  const { effectiveTheme, theme } = useThemeContext();
  const { currentLocation, permissionStatus, getCurrentLocation } = useLocation();
  const searchParams = useLocalSearchParams();
  
  // Get API key from config
  const API_KEY = APP_CONFIG.api.openWeatherMap.apiKey;
  
  const { 
    currentWeather, 
    forecast, 
    isLoading, 
    error, 
    fetchCurrentWeather, 
    fetchForecast,
    refreshWeather 
  } = useWeather(API_KEY);

  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(null);
  const processedSearchParams = useRef<string>('');

  // Memoized values for performance
  const locationToUse = useMemo(() => selectedLocation || currentLocation, [selectedLocation, currentLocation]);
  const hasSearchParams = useMemo(() => 
    !!(searchParams.latitude && searchParams.longitude), 
    [searchParams.latitude, searchParams.longitude]
  );
  const searchKey = useMemo(() => 
    hasSearchParams ? `${searchParams.latitude}-${searchParams.longitude}` : '', 
    [hasSearchParams, searchParams.latitude, searchParams.longitude]
  );
  
  // Memoized theme-dependent styles
  const containerStyle = useMemo(() => [
    styles.container, 
    { backgroundColor: theme.colors.background }
  ], [theme.colors.background, effectiveTheme]);

  const loadWeatherData = useCallback(async (location: LocationCoordinates) => {
    try {
      await Promise.all([
        fetchCurrentWeather(location.latitude, location.longitude),
        fetchForecast(location.latitude, location.longitude),
      ]);
    } catch (err) {
      console.error('Error loading weather data:', err);
      setSnackbarVisible(true);
    }
  }, [fetchCurrentWeather, fetchForecast]);

  const handleRefresh = useCallback(async () => {
    if (!locationToUse) return;
    
    setRefreshing(true);
    try {
      await refreshWeather(locationToUse.latitude, locationToUse.longitude);
    } catch (err) {
      console.error('Error refreshing weather:', err);
      setSnackbarVisible(true);
    } finally {
      setRefreshing(false);
    }
  }, [locationToUse, refreshWeather]);

  const handleLocationPress = useCallback(async () => {
    try {
      const location = await getCurrentLocation();
      if (location) {
        setSelectedLocation(null); // Clear selected location
        await loadWeatherData(location);
      }
    } catch (err) {
      console.error('Error getting current location:', err);
      setSnackbarVisible(true);
    }
  }, [getCurrentLocation, loadWeatherData]);

  // Initialize app and request location
  useEffect(() => {
    const initApp = async () => {
      // Wait for database initialization
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsInitializing(false);
      
      // Automatically request location when app starts
      try {
        const location = await getCurrentLocation();
        if (location) {
          await loadWeatherData(location);
        }
        } catch (err) {
          // Auto location request failed - user can manually request location
          // No need to log this as it's expected behavior
        }
    };
    
    initApp();
  }, []); // Empty dependency array for initialization

  // Handle search params changes - optimized approach
  useEffect(() => {
    const processSearchParams = async () => {
      if (hasSearchParams && !isInitializing) {
        // Only process if we haven't processed this search params before
        if (processedSearchParams.current !== searchKey) {
          processedSearchParams.current = searchKey;
          
          try {
            const lat = parseFloat(searchParams.latitude as string);
            const lon = parseFloat(searchParams.longitude as string);
            
            if (!isNaN(lat) && !isNaN(lon)) {
              const location: LocationCoordinates = {
                latitude: lat,
                longitude: lon,
              };
              setSelectedLocation(location);
              await loadWeatherData(location);
            }
          } catch (err) {
            console.error('Error loading search location:', err);
          }
        }
      }
    };
    
    processSearchParams();
  }, [hasSearchParams, searchKey, isInitializing, loadWeatherData]);

  // Load weather data when location is available (for manual requests)
  useEffect(() => {
    const loadCurrentLocationWeather = async () => {
      if (currentLocation && !isInitializing && !selectedLocation) {
        await loadWeatherData(currentLocation);
      }
    };
    
    loadCurrentLocationWeather();
  }, [currentLocation, isInitializing, selectedLocation]);


  // Show permission screen if location permission is not granted or no weather data
  if ((permissionStatus.status === 'denied' || permissionStatus.status === 'undetermined') && !currentWeather) {
    return (
      <View style={containerStyle} key={`permission-${effectiveTheme}`}>
        <View style={styles.permissionContainer}>
          <Text variant="headlineSmall" style={[styles.permissionTitle, { color: theme.colors.onSurface }]}>
            Location Access Required
          </Text>
          <Text variant="bodyLarge" style={[styles.permissionMessage, { color: theme.colors.onSurface }]}>
            Please enable location access to get weather for your current location.
          </Text>
          <FAB
            icon="map-marker"
            label="Enable Location"
            onPress={handleLocationPress}
            style={styles.fab}
          />
        </View>
      </View>
    );
  }

  if (isInitializing) {
    return (
      <View style={containerStyle} key={`initializing-${effectiveTheme}`}>
        <LoadingSpinner message="Getting your location..." />
      </View>
    );
  }

  if (isLoading && !currentWeather) {
    return (
      <View style={containerStyle} key={`loading-${effectiveTheme}`}>
        <LoadingSpinner message="Loading weather data..." />
      </View>
    );
  }

  if (error && !currentWeather) {
    return (
      <View style={containerStyle} key={`error-${effectiveTheme}`}>
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall" style={[styles.errorTitle, { color: theme.colors.onSurface }]}>
            Unable to Load Weather
          </Text>
          <Text variant="bodyLarge" style={[styles.errorMessage, { color: theme.colors.onSurface }]}>
            {error}
          </Text>
          <FAB
            icon="refresh"
            label="Try Again"
            onPress={handleLocationPress}
            style={styles.fab}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={containerStyle} key={`weather-${effectiveTheme}`}>
      {selectedLocation && searchParams.name && (
        <View style={[styles.locationHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline }]}>
          <Text variant="titleMedium" style={[styles.locationTitle, { color: theme.colors.onSurface }]}>
            {searchParams.name}
            {searchParams.state && `, ${searchParams.state}`}
            {searchParams.country && `, ${searchParams.country}`}
          </Text>
        </View>
      )}
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {currentWeather && (
          <WeatherCard
            key={`weather-${effectiveTheme}`}
            weather={currentWeather}
            temperatureUnit="celsius"
            windSpeedUnit="kmh"
            pressureUnit="hpa"
            showDetails={true}
          />
        )}


        {forecast && (
          <ForecastRow
            key={`forecast-${effectiveTheme}`}
            forecast={forecast.list}
            temperatureUnit="celsius"
          />
        )}

        {!currentWeather && !isLoading && (
          <View style={styles.emptyContainer}>
            <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
              No Weather Data
            </Text>
            <Text variant="bodyLarge" style={[styles.emptyMessage, { color: theme.colors.onSurface }]}>
              Tap the location button to get weather for your current location.
            </Text>
          </View>
        )}
      </ScrollView>

      <FAB
        icon="map-marker"
        label="Current Location"
        onPress={handleLocationPress}
        style={styles.fab}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
      >
        {error || 'An error occurred. Please try again.'}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  locationHeader: {
    padding: 16,
    borderBottomWidth: 1,
  },
  locationTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  permissionMessage: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  emptyMessage: {
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
