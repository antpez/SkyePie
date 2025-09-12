import React, { useEffect, useState, useRef, useCallback, useMemo, memo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Text, FAB, Snackbar, Button, SegmentedButtons } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { ForecastRow, HourlyForecast, LoadingSpinner, WeatherAlerts, WeatherIcon, TemperatureDisplay } from '@/components';
import { NetworkErrorDisplay, ConsistentCard, WeatherSkeleton, UniversalHeader } from '@/components/common';
import { FavoriteLocationCard } from '@/components/location';
import { useLocation } from '@/hooks';
import { useOfflineWeather } from '@/hooks/useOfflineWeather';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useUnits } from '@/contexts/UnitsContext';
import { useDatabase } from '@/contexts/DatabaseContext';
import { LocationCoordinates, Location } from '@/types';
import { APP_CONFIG } from '@/config/app';
import { offlineCacheService, userService } from '@/services';
import { formatTemperature, formatWindSpeed, formatHumidity, formatPressure, formatVisibility, formatTime, formatDayOfWeek } from '@/utils/formatters';
import { performanceMonitor } from '@/utils/performanceMonitor';
import '@/config/performance'; // Initialize performance monitoring

const WeatherScreen = memo(() => {
  // Performance monitoring - only track render time, not every render
  const renderStartTime = useRef<number | null>(null);
  
  useEffect(() => {
    if (__DEV__) {
      renderStartTime.current = performance.now();
      return () => {
        if (renderStartTime.current) {
          const renderTime = performance.now() - renderStartTime.current;
          if (renderTime > 100) { // Only log slow renders
            console.log(`🐌 WeatherScreen_render: ${renderTime.toFixed(2)}ms`);
          }
        }
      };
    }
  });

  const { effectiveTheme, theme } = useThemeContext();
  const { units } = useUnits();
  const { isInitialized: dbInitialized, isInitializing: dbInitializing, error: dbError } = useDatabase();
  const { currentLocation, permissionStatus, getCurrentLocation } = useLocation();
  const searchParams = useLocalSearchParams();
  
  // Get API key from config - memoized to prevent recreation
  const API_KEY = useMemo(() => APP_CONFIG.api.openWeatherMap.apiKey, []);
  
  // Check if API key is configured
  const isApiKeyConfigured = useMemo(() => {
    return API_KEY && API_KEY !== 'your_api_key_here' && API_KEY !== '';
  }, [API_KEY]);
  
  const { 
    currentWeather, 
    forecast, 
    alerts,
    isLoading, 
    error, 
    networkError,
    isOffline,
    isOnline,
    isSlowConnection,
    fetchCurrentWeather, 
    fetchForecast,
    fetchAlerts,
    refreshWeather,
    fastInitialize,
    clearNetworkError,
    refreshNetworkStatus
  } = useOfflineWeather(API_KEY);

  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasCachedData, setHasCachedData] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(null);
  const [showHourlyForecast, setShowHourlyForecast] = useState(false);
  const [favoriteLocations, setFavoriteLocations] = useState<Location[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoriteWeatherData, setFavoriteWeatherData] = useState<Record<string, any>>({});
  const processedSearchParams = useRef<string>('');
  const fetchCurrentWeatherRef = useRef(fetchCurrentWeather);

  // Update ref when fetchCurrentWeather changes
  useEffect(() => {
    fetchCurrentWeatherRef.current = fetchCurrentWeather;
  }, [fetchCurrentWeather]);

  // Memoized values for performance - optimized dependencies
  const locationToUse = useMemo(() => selectedLocation || currentLocation, [selectedLocation, currentLocation]);
  const hasSearchParams = useMemo(() => 
    !!(searchParams.latitude && searchParams.longitude), 
    [searchParams.latitude, searchParams.longitude]
  );
  const searchKey = useMemo(() => 
    hasSearchParams ? `${searchParams.latitude}-${searchParams.longitude}` : '', 
    [hasSearchParams, searchParams.latitude, searchParams.longitude]
  );

  // Memoized weather data processing
  const processedWeatherData = useMemo(() => {
    if (!currentWeather) return null;
    
    return {
      name: currentWeather.name,
      condition: currentWeather.weather[0]?.description || 'Clear sky',
      temperature: currentWeather.main.temp,
      feelsLike: currentWeather.main.feels_like,
      humidity: currentWeather.main.humidity,
      windSpeed: currentWeather.wind.speed,
      pressure: currentWeather.main.pressure,
      visibility: currentWeather.visibility,
      sunrise: currentWeather.sys.sunrise,
      sunset: currentWeather.sys.sunset,
      timezone: currentWeather.timezone,
      weatherIcon: currentWeather.weather[0] || { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }
    };
  }, [currentWeather]);

  // Memoized forecast processing
  const processedForecast = useMemo(() => {
    if (!forecast) return null;
    
    return {
      hourly: forecast.list.slice(0, 4),
      daily: forecast.list.reduce((acc, item) => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toDateString();
        
        if (!acc[dayKey]) {
          acc[dayKey] = {
            ...item,
            dailyHigh: item.main.temp_max,
            dailyLow: item.main.temp_min,
            weatherIcon: item.weather[0],
            dayName: formatDayOfWeek(item.dt),
            originalDate: date,
          };
        } else {
          acc[dayKey].dailyHigh = Math.max(acc[dayKey].dailyHigh, item.main.temp_max);
          acc[dayKey].dailyLow = Math.min(acc[dayKey].dailyLow, item.main.temp_min);
        }
        return acc;
      }, {} as Record<string, any>)
    };
  }, [forecast]);

  // (Weather map temporarily disabled)

  // Memoized theme styles for better performance
  const themeStyles = useMemo(() => ({
    container: [styles.container, { backgroundColor: theme.colors.background }],
    emptyTitle: [styles.emptyTitle, { color: theme.colors.onSurface }],
    emptyMessage: [styles.emptyMessage, { color: theme.colors.onSurface }],
    surface: { backgroundColor: theme.colors.surface },
    onSurface: { color: theme.colors.onSurface },
    onSurfaceVariant: { color: theme.colors.onSurfaceVariant },
    primary: { backgroundColor: theme.colors.primary },
    onPrimary: { color: theme.colors.onPrimary },
    error: { color: theme.colors.error },
    warning: { color: theme.colors.warning },
  }), [theme.colors]);

  const loadWeatherData = useCallback(async (location: LocationCoordinates) => {
    const startTime = performance.now();
    
    try {
      // Use Promise.allSettled to prevent one failure from stopping others
      const results = await Promise.allSettled([
        fetchCurrentWeather(location.latitude, location.longitude),
        fetchForecast(location.latitude, location.longitude),
        fetchAlerts(location.latitude, location.longitude),
      ]);
      
      // Log any failures but don't throw
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const operation = ['current weather', 'forecast', 'alerts'][index];
          console.warn(`Failed to load ${operation}:`, result.reason);
        }
      });
    } catch (err) {
      console.error('Error loading weather data:', err);
      setSnackbarVisible(true);
    } finally {
      // Only log if it took longer than 100ms
      const duration = performance.now() - startTime;
      if (__DEV__ && duration > 100) {
        console.log(`🐌 loadWeatherData: ${duration.toFixed(2)}ms`, { 
          location: `${location.latitude},${location.longitude}` 
        });
      }
    }
  }, [fetchCurrentWeather, fetchForecast, fetchAlerts]);


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

  // Load favorite locations with performance optimization
  const loadFavoriteLocations = useCallback(async () => {
    if (!dbInitialized) return;
    
    const startTime = performance.now();
    
    try {
      setFavoritesLoading(true);
      const user = await userService.getCurrentUser();
      const favorites = await offlineCacheService.getFavoriteLocations(user.id);
      setFavoriteLocations(favorites);
      
      if (favorites.length === 0) {
        setFavoriteWeatherData({});
        return;
      }
      
      // Process all favorites concurrently with proper error handling
      const weatherData: Record<string, any> = {};
      
      // Create all weather requests at once
      const weatherPromises = favorites.map(async (location) => {
        try {
          const weather = await fetchCurrentWeatherRef.current(location.latitude, location.longitude);
          return { locationId: location.id, weather };
        } catch (error) {
          // Only log errors in development
          if (__DEV__) {
            console.warn(`Failed to fetch weather for ${location.name}:`, error);
          }
          return { locationId: location.id, weather: null };
        }
      });
      
      // Wait for all requests to complete
      const weatherResults = await Promise.allSettled(weatherPromises);
      
      // Process results
      weatherResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.weather) {
          weatherData[result.value.locationId] = result.value.weather;
        }
      });
      
      setFavoriteWeatherData(weatherData);
    } catch (error) {
      console.error('Error loading favorite locations:', error);
    } finally {
      setFavoritesLoading(false);
      
      // Only log if it took longer than 100ms
      const duration = performance.now() - startTime;
      if (__DEV__ && duration > 100) {
        console.log(`🐌 loadFavoriteLocations: ${duration.toFixed(2)}ms`, { 
          favoritesCount: favoriteLocations.length 
        });
      }
    }
  }, [dbInitialized, favoriteLocations.length]);

  // Handle favorite location selection
  const handleFavoriteLocationSelect = useCallback((location: Location) => {
    const locationCoords: LocationCoordinates = {
      latitude: location.latitude,
      longitude: location.longitude,
    };
    setSelectedLocation(locationCoords);
    loadWeatherData(locationCoords);
  }, [loadWeatherData]);

  // Handle remove favorite
  const handleRemoveFavorite = useCallback(async (locationId: string) => {
    try {
      await offlineCacheService.removeFavoriteLocation(locationId);
      setFavoriteLocations(prev => prev.filter(loc => loc.id !== locationId));
    } catch (error) {
      console.error('Error removing favorite location:', error);
    }
  }, []);



  // Initialize app and request location with performance monitoring
  useEffect(() => {
    const initApp = async () => {
      const startTime = performance.now();
      
      try {
        // Don't wait for database - let it initialize in background
        // Only wait if database is actually initializing
        if (dbInitializing) {
          // Wait for database to be ready, but with a reasonable timeout
          const maxWaitTime = 2000; // 2 seconds max
          const checkInterval = 100; // Check every 100ms
          let waited = 0;
          
          while (dbInitializing && waited < maxWaitTime) {
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            waited += checkInterval;
          }
        }
        
        setIsInitializing(false);
        
        // Automatically request location when app starts
        try {
          const location = await getCurrentLocation();
          if (location) {
            // Try fast initialization first (load cached data immediately)
            const hasCached = await fastInitialize(location.latitude, location.longitude);
            setHasCachedData(hasCached);
            
            // Then load fresh data in background
            await loadWeatherData(location);
          }
        } catch (err) {
          // Use a fallback location (London) for testing
          const fallbackLocation: LocationCoordinates = {
            latitude: 51.5074,
            longitude: -0.1278,
          };
          
          // Try fast initialization with fallback location
          const hasCached = await fastInitialize(fallbackLocation.latitude, fallbackLocation.longitude);
          setHasCachedData(hasCached);
          
          // Then load fresh data
          await loadWeatherData(fallbackLocation);
        }
      } finally {
        // Only log if it took longer than 100ms
        const duration = performance.now() - startTime;
        if (__DEV__ && duration > 100) {
          console.log(`🐌 appInitialization: ${duration.toFixed(2)}ms`);
        }
      }
    };
    
    initApp();
  }, [dbInitializing]); // Add dbInitializing as dependency

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

  // Load favorites when database is ready
  useEffect(() => {
    loadFavoriteLocations();
  }, [loadFavoriteLocations]);



  // Consolidated loading and error states
  const getLoadingMessage = () => {
    if (dbInitializing) return "Setting up your weather app...";
    if (isInitializing) return "Finding your location...";
    if (isLoading && !currentWeather) return "Loading weather data...";
    return "Loading...";
  };

  const getLoadingProgress = () => {
    if (dbInitializing) return 0.2;
    if (isInitializing) return 0.5;
    if (isLoading && !currentWeather) return 0.8;
    return 0.1;
  };

  // Show database error
  if (dbError) {
    return (
      <View style={themeStyles.container} key={`db-error-${effectiveTheme}`}>
        <View style={styles.permissionContainer}>
          <Text variant="headlineSmall" style={[styles.permissionTitle, themeStyles.onSurface]}>
            Setup Error
          </Text>
          <Text variant="bodyLarge" style={[styles.permissionMessage, themeStyles.onSurface]}>
            {dbError}
          </Text>
          <Text variant="bodyMedium" style={[styles.permissionSubtext, themeStyles.onSurfaceVariant]}>
            Please restart the app to try again.
          </Text>
          <FAB
            icon="refresh"
            label="Restart App"
            onPress={() => {
              const { router } = require('expo-router');
              router.replace('/(tabs)/');
            }}
            style={styles.fab}
          />
        </View>
      </View>
    );
  }

  // Show API key configuration error
  if (!isApiKeyConfigured) {
    return (
      <View style={themeStyles.container} key={`api-key-error-${effectiveTheme}`}>
        <View style={styles.permissionContainer}>
          <Text variant="headlineSmall" style={[styles.permissionTitle, themeStyles.onSurface]}>
            API Key Required
          </Text>
          <Text variant="bodyLarge" style={[styles.permissionMessage, themeStyles.onSurface]}>
            SkyePie needs an OpenWeatherMap API key to fetch weather data.
          </Text>
          <Text variant="bodyMedium" style={[styles.permissionSubtext, themeStyles.onSurfaceVariant]}>
            1. Get a free API key from openweathermap.org{'\n'}
            2. Create a .env file in the project root{'\n'}
            3. Add: EXPO_PUBLIC_OPENWEATHER_API_KEY=your_key_here{'\n'}
            4. Restart the app
          </Text>
        </View>
      </View>
    );
  }

  // Show permission screen if location permission is not granted or no weather data
  if ((permissionStatus.status === 'denied' || permissionStatus.status === 'undetermined') && !currentWeather) {
    return (
      <View style={themeStyles.container} key={`permission-${effectiveTheme}`}>
        <View style={styles.permissionContainer}>
          <Text variant="headlineSmall" style={[styles.permissionTitle, themeStyles.onSurface]}>
            Location Access Required
          </Text>
          <Text variant="bodyLarge" style={[styles.permissionMessage, themeStyles.onSurface]}>
            SkyePie needs location access to provide accurate weather information for your area.
          </Text>
          <Text variant="bodyMedium" style={[styles.permissionSubtext, themeStyles.onSurfaceVariant]}>
            For iOS Simulator: Go to Device → Location → Custom Location and enter coordinates
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

  // Show consolidated loading state
  if (dbInitializing || isInitializing) {
    return (
      <View style={themeStyles.container} key={`loading-${effectiveTheme}`}>
        <LoadingSpinner 
          message={getLoadingMessage()} 
          progress={getLoadingProgress()}
          showProgress={true}
        />
      </View>
    );
  }

  // Show skeleton while loading fresh data (if no cached data)
  if (isLoading && !currentWeather && !hasCachedData) {
    return (
      <View style={themeStyles.container} key={`skeleton-${effectiveTheme}`}>
        <WeatherSkeleton showDetails={true} />
      </View>
    );
  }

  // Show error state with better UX
  if (error && !currentWeather) {
    return (
      <View style={themeStyles.container} key={`error-${effectiveTheme}`}>
        <View style={styles.errorStateContainer}>
          <Text variant="headlineSmall" style={[styles.errorTitle, themeStyles.onSurface]}>
            Unable to Load Weather
          </Text>
          <Text variant="bodyLarge" style={[styles.errorMessage, themeStyles.onSurface]}>
            {error}
          </Text>
          <Text variant="bodyMedium" style={[styles.errorSubtext, themeStyles.onSurfaceVariant]}>
            Check your internet connection and try again.
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
    <View style={themeStyles.container} key={`weather-${effectiveTheme}`}>
      {/* Universal Header */}
      <UniversalHeader 
        title="SkyePie" 
        backgroundColor={theme.colors.background}
        textColor={theme.colors.onSurface}
      />
      

      {/* Modern offline indicator */}
      {isOffline && (
        <View style={[styles.modernOfflineIndicator, { backgroundColor: theme.colors.warning + '20' }]}>
          <Text variant="labelMedium" style={[styles.modernOfflineText, { color: theme.colors.warning }]}>
            📡 Showing cached data (offline)
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            progressBackgroundColor={theme.colors.surface}
            title="Pull to refresh"
            titleColor={theme.colors.onSurface}
            progressViewOffset={80}
          />
        }
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
      >
        {/* Main weather display - no card container */}
        {processedWeatherData && (
          <View style={styles.weatherDisplayContainer}>
            {/* Weather header - no background */}
            <View style={styles.weatherHeader}>
              <View style={styles.locationInfo}>
                <Text variant="headlineMedium" style={[styles.locationName, { color: theme.colors.onSurface }]}>
                  {processedWeatherData.name}
                </Text>
                <Text variant="titleMedium" style={[styles.condition, { color: theme.colors.onSurfaceVariant }]}>
                  {processedWeatherData.condition}
                </Text>
              </View>
              <WeatherIcon 
                condition={processedWeatherData.weatherIcon} 
                size={80} 
              />
            </View>

            {/* Temperature section */}
            <View style={styles.temperatureSection}>
              <TemperatureDisplay
                temperature={processedWeatherData.temperature}
                unit={units.temperature}
                size="xlarge"
              />
              <Text variant="titleMedium" style={[styles.feelsLike, { color: theme.colors.onSurfaceVariant }]}>
                Feels like {formatTemperature(processedWeatherData.feelsLike, units.temperature)}
              </Text>
            </View>

            {/* Weather details - no card container */}
            <View style={styles.weatherDetailsContainer}>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text variant="labelMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Humidity
                  </Text>
                  <Text variant="titleMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                    {formatHumidity(processedWeatherData.humidity)}
                  </Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Text variant="labelMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Wind
                  </Text>
                  <Text variant="titleMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                    {formatWindSpeed(processedWeatherData.windSpeed, units.windSpeed)}
                  </Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Text variant="labelMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Pressure
                  </Text>
                  <Text variant="titleMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                    {formatPressure(processedWeatherData.pressure, units.pressure)}
                  </Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Text variant="labelMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Visibility
                  </Text>
                  <Text variant="titleMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                    {formatVisibility(processedWeatherData.visibility, units.distance)}
                  </Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Text variant="labelMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Sunrise
                  </Text>
                  <Text variant="titleMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                    {processedWeatherData.sunrise ? formatTime(processedWeatherData.sunrise, processedWeatherData.timezone) : 'N/A'}
                  </Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Text variant="labelMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Sunset
                  </Text>
                  <Text variant="titleMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                    {processedWeatherData.sunset ? formatTime(processedWeatherData.sunset, processedWeatherData.timezone) : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Weather alerts - no card container */}
        {alerts && alerts.length > 0 && (
          <View style={styles.alertsContainer}>
            <Text variant="titleMedium" style={[styles.alertsTitle, { color: theme.colors.onSurface }]}>
              Weather Alerts
            </Text>
            <View style={styles.alertsList}>
              {alerts.map((alert, index) => (
                <View 
                  key={`alert-${index}`} 
                  style={[styles.alertItem, { backgroundColor: theme.colors.surfaceVariant }]}
                >
                  <Text variant="titleSmall" style={[styles.alertEvent, { color: theme.colors.onSurface }]}>
                    {alert.event}
                  </Text>
                  <Text variant="bodyMedium" style={[styles.alertDescription, { color: theme.colors.onSurfaceVariant }]}>
                    {alert.description}
                  </Text>
                  <Text variant="bodySmall" style={[styles.alertTime, { color: theme.colors.onSurfaceVariant }]}>
                    {new Date(alert.start * 1000).toLocaleString()} - {new Date(alert.end * 1000).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Network error display */}
        {networkError && (
          <View style={styles.errorContainer}>
            <NetworkErrorDisplay
              key={`network-error-${effectiveTheme}`}
              error={networkError}
              onRetry={async () => {
                clearNetworkError();
                if (locationToUse) {
                  await loadWeatherData(locationToUse);
                }
              }}
              onDismiss={clearNetworkError}
            />
          </View>
        )}

        {/* Forecast section - no card containers */}
        {processedForecast && (
          <View key={`forecast-container-${effectiveTheme}`} style={styles.forecastContainer}>
            
            {showHourlyForecast ? (
              <View style={styles.hourlyForecastContainer}>
                <View style={styles.forecastHeaderContainer}>
                  <Text variant="titleLarge" style={[styles.forecastSectionTitle, { color: theme.colors.onSurface }]}>
                    12-Hour Forecast
                  </Text>
                  <View style={styles.forecastToggleContainer}>
                  <SegmentedButtons
                    value={showHourlyForecast ? 'hourly' : 'daily'}
                    onValueChange={(value) => setShowHourlyForecast(value === 'hourly')}
                    buttons={[
                      {
                        value: 'daily',
                        label: 'Daily',
                        icon: 'calendar-today',
                      },
                      {
                        value: 'hourly',
                        label: 'Hourly',
                        icon: 'clock-outline',
                      },
                    ]}
                    style={[styles.modernSegmentedButtons, { backgroundColor: theme.colors.surfaceVariant }]}
                    theme={{
                      colors: {
                        outline: 'transparent',
                        outlineVariant: 'transparent',
                        primary: theme.colors.primary,
                        onPrimary: theme.colors.onPrimary,
                        surface: theme.colors.surfaceVariant,
                        onSurface: theme.colors.onSurface,
                        surfaceVariant: theme.colors.surfaceVariant,
                        onSurfaceVariant: theme.colors.onSurfaceVariant,
                        secondary: theme.colors.primary,
                        onSecondary: theme.colors.onPrimary,
                      }
                    }}
                  />
                  </View>
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.hourlyScrollContent}
                >
                  {processedForecast.hourly.map((item, index) => (
                    <View key={`${item.dt}-${index}`} style={styles.hourlyItem}>
                      <Text variant="bodySmall" style={[styles.hourlyTime, { color: theme.colors.onSurface }]}>
                        {formatTime(item.dt)}
                      </Text>
                      <WeatherIcon condition={item.weather[0]} size={32} />
                      <Text variant="bodyMedium" style={[styles.hourlyTemp, { color: theme.colors.onSurface }]}>
                        {formatTemperature(item.main.temp, units.temperature).replace(/[°CF]/, '')}
                      </Text>
                      <Text variant="bodySmall" style={[styles.hourlyDesc, { color: theme.colors.onSurfaceVariant }]}>
                        {item.weather[0]?.description || ''}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View style={styles.dailyForecastContainer}>
                <View style={styles.forecastHeaderContainer}>
                  <Text variant="titleLarge" style={[styles.forecastSectionTitle, { color: theme.colors.onSurface }]}>
                    7-Day Forecast
                  </Text>
                  <View style={styles.forecastToggleContainer}>
                  <SegmentedButtons
                    value={showHourlyForecast ? 'hourly' : 'daily'}
                    onValueChange={(value) => setShowHourlyForecast(value === 'hourly')}
                    buttons={[
                      {
                        value: 'daily',
                        label: 'Daily',
                        icon: 'calendar-today',
                      },
                      {
                        value: 'hourly',
                        label: 'Hourly',
                        icon: 'clock-outline',
                      },
                    ]}
                    style={[styles.modernSegmentedButtons, { backgroundColor: theme.colors.surfaceVariant }]}
                    theme={{
                      colors: {
                        outline: 'transparent',
                        outlineVariant: 'transparent',
                        primary: theme.colors.primary,
                        onPrimary: theme.colors.onPrimary,
                        surface: theme.colors.surfaceVariant,
                        onSurface: theme.colors.onSurface,
                        surfaceVariant: theme.colors.surfaceVariant,
                        onSurfaceVariant: theme.colors.onSurfaceVariant,
                        secondary: theme.colors.primary,
                        onSecondary: theme.colors.onPrimary,
                      }
                    }}
                  />
                  </View>
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dailyScrollContent}
                >
                  {Object.values(processedForecast.daily)
                    .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime())
                    .slice(0, 7)
                    .map((item, index) => (
                      <View key={`${item.dt}-${index}`} style={styles.dailyItem}>
                        <Text variant="bodySmall" style={[styles.dailyName, { color: theme.colors.onSurface }]}>
                          {item.dayName}
                        </Text>
                        <WeatherIcon condition={item.weatherIcon} size={32} />
                        <View style={styles.dailyTemps}>
                          <Text variant="bodyMedium" style={[styles.dailyHigh, { color: theme.colors.onSurface }]}>
                            {formatTemperature(item.dailyHigh, units.temperature).replace(/[°CF]/, '')}
                          </Text>
                          <Text variant="bodySmall" style={[styles.dailyLow, { color: theme.colors.onSurfaceVariant }]}>
                            {formatTemperature(item.dailyLow, units.temperature).replace(/[°CF]/, '')}
                          </Text>
                        </View>
                      </View>
                    ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Favorites Section - no card container */}
        {favoriteLocations.length > 0 && (
          <View style={styles.favoritesContainer}>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Favorite Locations
            </Text>
            <View style={styles.favoritesList}>
              {favoriteLocations.map((location) => {
                const weather = favoriteWeatherData[location.id];
                return (
                  <View 
                    key={`favorite-${location.id}-${effectiveTheme}`}
                    style={[styles.favoriteItem, { backgroundColor: theme.colors.surfaceVariant }]}
                  >
                    <View style={styles.favoriteContent}>
                      <View style={styles.favoriteInfo}>
                        <Text 
                          variant="titleMedium" 
                          style={[styles.favoriteName, { color: theme.colors.onSurface }]}
                          onPress={() => handleFavoriteLocationSelect(location)}
                        >
                          {location.name}
                        </Text>
                        <Text 
                          variant="bodyMedium" 
                          style={[styles.favoriteDetails, { color: theme.colors.onSurfaceVariant }]}
                        >
                          {location.state && `${location.state}, `}{location.country}
                        </Text>
                      </View>
                      {weather && (
                        <View style={styles.favoriteWeather}>
                          <WeatherIcon 
                            condition={weather.weather[0] || { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }} 
                            size={32} 
                          />
                          <Text variant="titleMedium" style={[styles.favoriteTemp, { color: theme.colors.onSurface }]}>
                            {formatTemperature(weather.main.temp, units.temperature)}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Button
                      mode="text"
                      onPress={() => handleRemoveFavorite(location.id)}
                      icon="close"
                      compact
                      style={[styles.removeFavoriteButton, { borderColor: theme.colors.error }]}
                      textColor={theme.colors.error}
                    >
                      {""}
                    </Button>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Empty state with modern design */}
        {!currentWeather && !isLoading && (
          <View style={styles.modernEmptyContainer}>
            <Text variant="headlineMedium" style={[styles.modernEmptyTitle, { color: theme.colors.onSurface }]}>
              No Weather Data
            </Text>
            <Text variant="bodyLarge" style={[styles.modernEmptyMessage, { color: theme.colors.onSurfaceVariant }]}>
              Tap the location button to get weather for your current location.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modern FAB */}
      <FAB
        icon="map-marker"
        onPress={handleLocationPress}
        style={[styles.modernFab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={{ backgroundColor: theme.colors.error }}
      >
        {error || 'An error occurred. Please try again.'}
      </Snackbar>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100, // Space for UniversalHeader only
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for FAB
  },
  // Modern header styles
  modernHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  modernLocationTitle: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 20,
  },
  // Modern offline indicator
  modernOfflineIndicator: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modernOfflineText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Container styles
  alertsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  errorContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  forecastContainer: {
    marginBottom: 24,
  },
  forecastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  favoritesContainer: {
    marginHorizontal: 36, // Equal padding on both sides
    marginBottom: 24,
  },
  // Modern empty state
  modernEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
    minHeight: 300,
  },
  modernEmptyTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '700',
  },
  modernEmptyMessage: {
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  // Permission and error states
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '700',
    fontSize: 24,
  },
  permissionMessage: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
    fontSize: 16,
  },
  permissionSubtext: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
    fontSize: 14,
    opacity: 0.7,
  },
  // Error state container
  errorStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '700',
    fontSize: 24,
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
    fontSize: 16,
  },
  errorSubtext: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
    fontSize: 14,
    opacity: 0.7,
  },
  // Legacy empty state (keeping for compatibility)
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
  // Legacy offline indicator
  offlineIndicator: {
    padding: 8,
    alignItems: 'center',
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Modern FAB
  modernFab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  // Legacy FAB
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  // Forecast toggle
  forecastToggleContainer: {
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modernSegmentedButtons: {
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
  },
  // Legacy segmented buttons
  segmentedButtons: {
    borderRadius: 8,
  },
  // Section titles
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '700',
    fontSize: 20,
  },
  // Forecast section title (separate from other section titles)
  forecastSectionTitle: {
    marginBottom: 16,
    fontWeight: '700',
    fontSize: 20,
  },
  // Forecast header container (title and buttons with margin)
  forecastHeaderContainer: {
    marginHorizontal: 36, // Align with favoritesContainer
  },
  
  // Weather display styles (no cards)
  weatherDisplayContainer: {
    margin: 16,
  },
  // Removed gradient styles - no background
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontWeight: '700',
    fontSize: 24,
    marginBottom: 4,
  },
  condition: {
    fontSize: 16,
    opacity: 0.9,
  },
  temperatureSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  feelsLike: {
    fontSize: 16,
    opacity: 0.8,
    marginTop: 8,
  },
  weatherDetailsContainer: {
    padding: 16,
    marginTop: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Forecast styles (no cards)
  hourlyForecastContainer: {
    marginTop: 16,
  },
  dailyForecastContainer: {
    marginTop: 16,
  },
  forecastTitle: {
    marginBottom: 12,
    fontWeight: '700', // Made bolder to match other section titles
  },
  hourlyScrollContent: {
    paddingHorizontal: 0, // No padding - cards float off screen edges
  },
  dailyScrollContent: {
    paddingHorizontal: 0, // No padding - cards float off screen edges
  },
  hourlyItem: {
    padding: 16,
    marginRight: 4, // Reduced spacing between icons
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  dailyItem: {
    padding: 16,
    marginRight: 4, // Reduced spacing between icons
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  hourlyTime: {
    marginBottom: 8,
    fontWeight: '600',
  },
  dailyName: {
    marginBottom: 8,
    fontWeight: '600',
  },
  hourlyTemp: {
    marginTop: 8,
    fontWeight: '600',
  },
  dailyTemps: {
    marginTop: 8,
    alignItems: 'center',
  },
  dailyHigh: {
    fontWeight: '600',
  },
  dailyLow: {
    marginTop: 2,
  },
  hourlyDesc: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 10,
  },
  
  // Favorites styles (no cards)
  favoritesList: {
    gap: 12,
  },
  favoriteItem: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  favoriteContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  favoriteDetails: {
    opacity: 0.8,
  },
  favoriteWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  favoriteTemp: {
    marginLeft: 8,
    fontWeight: '600',
  },
  removeFavoriteButton: {
    marginLeft: 8,
    marginRight: 10, // 10px away from the edge of the favorite card
  },
  
  // Alerts styles (no cards)
  alertsTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  alertsList: {
    gap: 12,
  },
  alertItem: {
    padding: 16,
    borderRadius: 12,
  },
  alertEvent: {
    fontWeight: '600',
    marginBottom: 8,
  },
  alertDescription: {
    marginBottom: 8,
    lineHeight: 20,
  },
  alertTime: {
    opacity: 0.8,
  },
});

export default WeatherScreen;
