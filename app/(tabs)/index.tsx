import React, { useEffect, useState, useRef, useCallback, useMemo, memo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert, Animated, LayoutAnimation, Platform, UIManager, AppState } from 'react-native';
import { Text, FAB, Snackbar, Button, SegmentedButtons } from 'react-native-paper';
import { useLocalSearchParams, useFocusEffect, router } from 'expo-router';
import { ForecastRow, HourlyForecast, LoadingSpinner, WeatherAlerts, WeatherIcon, TemperatureDisplay, WeatherMap } from '@/components';
import { NetworkErrorDisplay, ConsistentCard, WeatherSkeleton, UniversalHeader } from '@/components/common';
import FloatingFAB from '@/components/common/FloatingFAB';
import { FavoriteLocationCard } from '@/components/location';
import { useLocation } from '@/hooks';
import { useOfflineWeather } from '@/hooks/useOfflineWeather';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useUnits } from '@/contexts/UnitsContext';
import { useDisplayPreferences } from '@/contexts/DisplayPreferencesContext';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useWeatherMaps } from '@/contexts/WeatherMapsContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedLocation, setCurrentLocation } from '@/store/slices/locationSlice';
import { selectSelectedLocation, selectCurrentLocation } from '@/store/selectors';
import { LocationCoordinates, Location } from '@/types';
import { APP_CONFIG } from '@/config/app';
import { offlineCacheService, userService, storageService } from '@/services';
import { locationRepository } from '@/database/repositories/locationRepository';
import { formatTemperature, formatWindSpeed, formatHumidity, formatRainfall, formatVisibility, formatTime, formatDayOfWeek } from '@/utils/formatters';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { errorLogger } from '@/utils/errorLogger';
import '@/config/performance'; // Initialize performance monitoring
import '@/utils/launchOptimizer'; // Initialize launch optimizations

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const WeatherScreen = memo(() => {
  // Animation values for smooth transitions
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // Performance monitoring - only track render time, not every render
  const renderStartTime = useRef<number | null>(null);
  
  useEffect(() => {
    if (__DEV__) {
      renderStartTime.current = performance.now();
      return () => {
        if (renderStartTime.current) {
          const renderTime = performance.now() - renderStartTime.current;
          if (renderTime > 100) { // Only log slow renders
          }
        }
      };
    }
  });

  // Animate in on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const { effectiveTheme, theme } = useThemeContext();
  const { units } = useUnits();
  const { preferences: displayPreferences } = useDisplayPreferences();
  const { isInitialized: dbInitialized, isInitializing: dbInitializing, error: dbError } = useDatabase();
  const { currentLocation, permissionStatus, getCurrentLocation } = useLocation();
  const { updateCenter } = useWeatherMaps();
  const searchParams = useLocalSearchParams();
  const dispatch = useDispatch();
  const selectedLocation = useSelector(selectSelectedLocation);
  const reduxCurrentLocation = useSelector(selectCurrentLocation);
  
  // Debug selectedLocation state (disabled for production)
  // useEffect(() => {
  //   if (__DEV__ && selectedLocation) {
  //     console.log('Selected location changed:', selectedLocation.name);
  //   }
  // }, [selectedLocation]);
  
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
    setError,
    networkError,
    isOffline,
    isOnline,
    isSlowConnection,
    fetchCurrentWeather, 
    fetchForecast,
    fetchAlerts,
    refreshWeather,
    fastLoadWeather,
    fastInitialize,
    clearNetworkError,
    refreshNetworkStatus
  } = useOfflineWeather(API_KEY);

  // Network status monitoring for adaptive accuracy
  const { networkStatus: currentNetworkStatus, isOnline: networkIsOnline, isSlowConnection: networkIsSlow } = useNetworkStatus();

  // Update weather service configuration when network conditions change
  useEffect(() => {
    // Update configuration when network conditions change
    console.log('🌐 Network conditions changed, updating service configuration');
  }, [currentNetworkStatus, networkIsOnline, networkIsSlow]);

  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasCachedData, setHasCachedData] = useState(false);
  const [showHourlyForecast, setShowHourlyForecast] = useState(true);
  const [lastBackgroundTime, setLastBackgroundTime] = useState<number | null>(null);
  
  // Animation for forecast toggle
  const handleForecastToggle = useCallback((value: string) => {
    const newShowHourly = value === 'hourly';
    if (newShowHourly !== showHourlyForecast) {
      // Add smooth layout animation
      LayoutAnimation.configureNext({
        duration: 300,
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
      });
      setShowHourlyForecast(newShowHourly);
    }
  }, [showHourlyForecast]);
  const [favoriteLocations, setFavoriteLocations] = useState<Location[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoriteWeatherData, setFavoriteWeatherData] = useState<Record<string, any>>({});
  const processedSearchParams = useRef<string>('');
  const fetchCurrentWeatherRef = useRef(fetchCurrentWeather);
  const lastFavoritesLoadTime = useRef<number>(0);
  const [hasProcessedSearchParams, setHasProcessedSearchParams] = useState(false);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const [mapRefreshKey, setMapRefreshKey] = useState(0);

  // Update ref when fetchCurrentWeather changes
  useEffect(() => {
    fetchCurrentWeatherRef.current = fetchCurrentWeather;
  }, [fetchCurrentWeather]); // Add proper dependency

  // Memoized values for performance - optimized dependencies
  const locationToUse = useMemo(() => {
    if (selectedLocation) {
      if (__DEV__) {
        console.log('📍 Using selected location for weather and map:', selectedLocation.name, selectedLocation.latitude, selectedLocation.longitude);
      }
      return {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      };
    }
    // Use Redux current location if available, otherwise fall back to hook's current location
    if (reduxCurrentLocation) {
      if (__DEV__) {
        console.log('📍 Using Redux current location for weather and map:', reduxCurrentLocation.name, reduxCurrentLocation.latitude, reduxCurrentLocation.longitude);
      }
      return {
        latitude: reduxCurrentLocation.latitude,
        longitude: reduxCurrentLocation.longitude,
      };
    }
    if (__DEV__) {
      console.log('📍 Using hook current location for weather and map:', currentLocation?.latitude, currentLocation?.longitude);
    }
    return currentLocation;
  }, [selectedLocation, reduxCurrentLocation, currentLocation]);

  // Update map refresh key when location changes
  useEffect(() => {
    if (locationToUse) {
      if (__DEV__) {
        console.log('🗺️ Location changed, updating map refresh key:', locationToUse.latitude, locationToUse.longitude);
      }
      setMapRefreshKey(prev => prev + 1);
    }
  }, [locationToUse?.latitude, locationToUse?.longitude]);

  // Log weather data when it changes (development only)
  useEffect(() => {
    if (currentWeather && __DEV__ && currentWeather.dt) {
      console.log('🌤️ Weather data loaded for location:', {
        location: locationToUse,
        weather: {
          name: currentWeather.name,
          coord: currentWeather.coord,
          main: currentWeather.main,
          weather: currentWeather.weather?.[0]
        }
      });
      
      // Compare weather coordinates with current location
      if (currentWeather.coord && locationToUse) {
        const coordMatch = Math.abs(currentWeather.coord.lat - locationToUse.latitude) < 0.01 && 
                          Math.abs(currentWeather.coord.lon - locationToUse.longitude) < 0.01;
        console.log('🔍 Weather vs Location comparison:', {
          weatherCoords: { lat: currentWeather.coord.lat, lon: currentWeather.coord.lon },
          currentLocation: { lat: locationToUse.latitude, lon: locationToUse.longitude },
          coordinatesMatch: coordMatch,
          weatherName: currentWeather.name,
          locationName: selectedLocation?.name || 'Current Location'
        });
      }
    }
  }, [currentWeather?.dt, locationToUse, selectedLocation]);

  // Track last coordinates to prevent unnecessary updates
  const lastCoordinatesRef = useRef<{ lat: number; lon: number } | null>(null);
  
  // Track last weather fetch time to prevent rapid successive calls
  const lastWeatherFetchRef = useRef<number>(0);
  const WEATHER_FETCH_DEBOUNCE_MS = 2000; // 2 seconds

  const loadWeatherData = useCallback(async (location: LocationCoordinates) => {
    // Prevent multiple simultaneous weather calls
    if (isLoadingWeather) {
      if (__DEV__) {
        console.log('⏳ Weather already loading, skipping duplicate call');
      }
      return;
    }

    // Debounce rapid successive calls
    const now = Date.now();
    if (now - lastWeatherFetchRef.current < WEATHER_FETCH_DEBOUNCE_MS) {
      if (__DEV__) {
        console.log('⏳ Weather fetch debounced, too soon since last call');
      }
      return;
    }
    lastWeatherFetchRef.current = now;

    // Check if we're offline and have no cached data
    if (!networkIsOnline && !hasCachedData) {
      if (__DEV__) {
        console.log('📴 Offline and no cached data, skipping weather fetch');
      }
      setError('No internet connection and no cached weather data available');
      setSnackbarVisible(true);
      return;
    }
    
    const startTime = performance.now();
    setIsLoadingWeather(true);
    
    try {
      // Validate location coordinates
      if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
        throw new Error('Invalid location coordinates provided');
      }
      
      if (location.latitude < -90 || location.latitude > 90 || location.longitude < -180 || location.longitude > 180) {
        throw new Error('Location coordinates are out of valid range');
      }
      
      // Ensure we're using the most recent locationToUse if available
      const coordinatesToUse = locationToUse && 
        Math.abs(locationToUse.latitude - location.latitude) < 0.001 && 
        Math.abs(locationToUse.longitude - location.longitude) < 0.001 
        ? locationToUse 
        : location;
      
      if (__DEV__) {
        console.log('🌤️ Loading weather data for coordinates:', location.latitude, location.longitude);
        console.log('🌐 Network status:', networkIsOnline ? 'online' : 'offline');
        console.log('💾 Has cached data:', hasCachedData);
      }
      
      // Use Promise.allSettled to prevent one failure from stopping others
      const results = await Promise.allSettled([
        fetchCurrentWeather(coordinatesToUse.latitude, coordinatesToUse.longitude, 'celsius', false, coordinatesToUse.accuracy).catch(err => {
          console.warn('Current weather fetch failed:', err);
          return null;
        }),
        fetchForecast(coordinatesToUse.latitude, coordinatesToUse.longitude, 'celsius', false, coordinatesToUse.accuracy).catch(err => {
          console.warn('Forecast fetch failed:', err);
          return null;
        }),
        // Temporarily disable alerts to prevent infinite loop
        // fetchAlerts(coordinatesToUse.latitude, coordinatesToUse.longitude),
      ]);
      
      // Log any failures but don't throw
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const operation = ['current weather', 'forecast'][index];
          errorLogger.warn(`Failed to load ${operation}`, 'WeatherScreen', {
            operation,
            error: result.reason,
            location: { latitude: coordinatesToUse.latitude, longitude: coordinatesToUse.longitude }
          });
          
          // Set error state for critical failures
          if (index === 0 && !currentWeather) { // Current weather is critical
            setError(`Failed to load weather data: ${result.reason}`);
          }
        }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      errorLogger.error('Error loading weather data', err as Error, 'WeatherScreen', {
        location: { latitude: location.latitude, longitude: location.longitude },
        duration: performance.now() - startTime
      });
      setError(errorMessage);
      setSnackbarVisible(true);
    } finally {
      setIsLoadingWeather(false);
      // Only log if it took longer than 100ms
      const duration = performance.now() - startTime;
      // if (__DEV__ && duration > 100) {
      //   errorLogger.info(`Weather data loading took ${duration.toFixed(2)}ms`, 'WeatherScreen', {
      //     duration,
      //     location: { latitude: location.latitude, longitude: location.longitude }
      //   });
      // }
    }
  }, [fetchCurrentWeather, fetchForecast, currentWeather, isLoadingWeather, locationToUse]);

  // Auto-fetch weather when location permission is granted (for fresh installs)
  useEffect(() => {
    if (permissionStatus.status === 'granted' && !currentWeather && !isLoading && !isInitializing) {
      console.log('📍 Permission granted, auto-fetching weather data...');
      // Call handleLocationPress directly without dependency
      const autoFetchLocation = async () => {
        // Skip auto-fetch if offline and no cached data
        if (!networkIsOnline && !hasCachedData) {
          console.log('📴 Skipping auto-fetch: offline and no cached data');
          return;
        }
        try {
          setError(null); // Clear any existing errors
          const location = await getCurrentLocation();
          
          if (!location) {
            throw new Error('Unable to get current location. Please check your location permissions.');
          }
          
          // Validate location data
          if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
            throw new Error('Invalid location data received');
          }
          
          // Create a Location object for Redux
          const locationObj: Location = {
            id: `current-${location.latitude}-${location.longitude}`,
            name: 'Current Location',
            country: '',
            state: '',
            latitude: location.latitude,
            longitude: location.longitude,
            isCurrent: true,
            isFavorite: false,
            searchCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          dispatch(setCurrentLocation(locationObj));
          dispatch(setSelectedLocation(locationObj)); // Also set as selected location so map updates
          
          await loadWeatherData(location);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to get current location';
          errorLogger.error('Error getting current location', err as Error, 'WeatherScreen', {
            action: 'getCurrentLocation',
            errorType: err instanceof Error ? err.constructor.name : 'Unknown'
          });
          setError(errorMessage);
          setSnackbarVisible(true);
        }
      };
      
      autoFetchLocation();
    }
  }, [permissionStatus.status, currentWeather, isLoading, isInitializing, getCurrentLocation, loadWeatherData, dispatch, networkIsOnline, hasCachedData]);

  // Refresh weather when app comes to foreground (with intelligent timing)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      const now = Date.now();
      
      if (nextAppState === 'active' && currentWeather && !isLoading && locationToUse) {
        // Only refresh if app was in background for more than 5 minutes
        const shouldRefresh = !lastBackgroundTime || (now - lastBackgroundTime) > 5 * 60 * 1000;
        
        if (shouldRefresh) {
          console.log('🔄 App came to foreground, refreshing weather data...');
          refreshWeather(locationToUse.latitude, locationToUse.longitude).catch(error => {
            console.error('🔄 Error refreshing weather on app foreground:', error);
          });
        } else {
          console.log('🔄 App came to foreground, skipping refresh (too recent)');
        }
        
        setLastBackgroundTime(null);
      } else if (nextAppState === 'background') {
        setLastBackgroundTime(now);
        console.log('🔄 App went to background');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [currentWeather, isLoading, refreshWeather, lastBackgroundTime, locationToUse]);

  // Update WeatherMapsContext when location changes
  useEffect(() => {
    if (locationToUse) {
      const currentCoords = { lat: locationToUse.latitude, lon: locationToUse.longitude };
      const lastCoords = lastCoordinatesRef.current;
      
      // Only update if coordinates have actually changed
      if (!lastCoords || 
          Math.abs(lastCoords.lat - currentCoords.lat) > 0.0001 || 
          Math.abs(lastCoords.lon - currentCoords.lon) > 0.0001) {
        
        console.log('🗺️ Updating WeatherMapsContext center:', currentCoords.lat, currentCoords.lon);
        lastCoordinatesRef.current = currentCoords;
        
        updateCenter(currentCoords.lat, currentCoords.lon).catch(error => {
          console.error('🗺️ Error updating WeatherMapsContext center:', error);
        });
      }
    }
  }, [locationToUse?.latitude, locationToUse?.longitude]); // Removed updateCenter from dependencies

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
    
    // Only log when weather data changes (not on every render)
    if (__DEV__ && currentWeather.dt) {
      console.log('Processing weather data for location:', currentWeather.name, 'Coordinates from weather API response:', currentWeather.coord?.lat, currentWeather.coord?.lon);
    }
    
    // Add safety checks for all object properties
    const processedData = {
      name: currentWeather.name || 'Unknown Location',
      condition: currentWeather.weather?.[0]?.description || 'Clear sky',
      temperature: currentWeather.main?.temp || 0,
      feelsLike: currentWeather.main?.feels_like || 0,
      humidity: currentWeather.main?.humidity || 0,
      windSpeed: currentWeather.wind?.speed || 0,
      rainfall: currentWeather.rain?.['1h'] || 0,
      visibility: currentWeather.visibility || 0,
      sunrise: currentWeather.sys?.sunrise || 0,
      sunset: currentWeather.sys?.sunset || 0,
      timezone: currentWeather.timezone || 0,
      weatherIcon: currentWeather.weather?.[0] || { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }
    };


    return processedData;
  }, [currentWeather]);

  // Memoized forecast processing
  const processedForecast = useMemo(() => {
    if (!forecast) return null;
    
    // Get today's date for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Process all forecast data and group by day
    const dailyData = (forecast?.list || []).reduce((acc, item) => {
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
    }, {} as Record<string, any>);
    
    // Get all days and filter out today, then take up to 6 days
    const allDays = Object.values(dailyData).sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());
    const futureDays = (allDays || []).filter(day => {
      const dayDate = new Date(day.originalDate);
      dayDate.setHours(0, 0, 0, 0);
      return dayDate > today;
    });
    
    return {
      hourly: (forecast?.list || []).slice(0, 4),
      daily: (futureDays || []).slice(0, 6) // Take up to 6 days starting from tomorrow
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



  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setIsGettingCurrentLocation(true);
    try {
      if (__DEV__) {
        console.log('🔄 Refresh triggered - getting current location');
        console.log('🌐 Network status:', networkIsOnline ? 'online' : 'offline');
      }
      
      // Check if we're offline and have no cached data
      if (!networkIsOnline && !hasCachedData) {
        if (__DEV__) {
          console.log('📴 Refresh skipped: offline and no cached data');
        }
        setError('No internet connection and no cached weather data available');
        setSnackbarVisible(true);
        return;
      }

      // If offline but have cached data, only refresh location, not weather
      if (!networkIsOnline && hasCachedData) {
        if (__DEV__) {
          console.log('📴 Offline refresh: updating location only, using cached weather data');
        }
        // Still get current location for map updates, but don't fetch weather
        const currentLocation = await getCurrentLocation();
        if (currentLocation) {
          const locationObj: Location = {
            id: `current-${currentLocation.latitude}-${currentLocation.longitude}`,
            name: 'Current Location',
            country: '',
            state: '',
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            isCurrent: true,
            isFavorite: false,
            searchCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          dispatch(setCurrentLocation(locationObj));
          dispatch(setSelectedLocation(locationObj));
        }
        return;
      }
      
      // Get current location first
      const currentLocation = await getCurrentLocation();
      
      if (currentLocation) {
        if (__DEV__) {
        }
        
        // Create a Location object for Redux
        const locationObj: Location = {
          id: `current-${currentLocation.latitude}-${currentLocation.longitude}`,
          name: 'Current Location',
          country: '',
          state: '',
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          isCurrent: true,
          isFavorite: false,
          searchCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Update Redux state
        dispatch(setCurrentLocation(locationObj));
        dispatch(setSelectedLocation(locationObj));
        
        // Refresh weather data with current location
        try {
          await refreshWeather(currentLocation.latitude, currentLocation.longitude);
        } catch (weatherError) {
          console.warn('Weather refresh failed:', weatherError);
          // Don't throw - let the app continue with cached data if available
        }
        
        if (__DEV__) {
          console.log('✅ Refresh completed with current location');
        }
      } else {
        // Fallback to existing location if current location fails
        if (locationToUse) {
          if (__DEV__) {
            console.log('⚠️ Current location failed, refreshing with existing location');
          }
          try {
            await refreshWeather(locationToUse.latitude, locationToUse.longitude);
          } catch (weatherError) {
            console.warn('Weather refresh with fallback location failed:', weatherError);
            // Don't throw - let the app continue with cached data if available
          }
        } else {
          if (__DEV__) {
            console.log('❌ No location available for refresh');
          }
          setError('Unable to get your current location. Please check location permissions.');
          setSnackbarVisible(true);
        }
      }
    } catch (err) {
      console.error('Error refreshing weather:', err);
      setSnackbarVisible(true);
    } finally {
      setRefreshing(false);
      setIsGettingCurrentLocation(false);
    }
  }, [getCurrentLocation, refreshWeather, dispatch, locationToUse, networkIsOnline, hasCachedData]);

  const handleLocationPress = useCallback(async () => {
    try {
      setError(null); // Clear any existing errors
      const location = await getCurrentLocation();
      
      if (!location) {
        throw new Error('Unable to get current location. Please check your location permissions.');
      }
      
      // Validate location data
      if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
        throw new Error('Invalid location data received');
      }
      
      // Create a Location object for Redux
      const locationObj: Location = {
        id: `current-${location.latitude}-${location.longitude}`,
        name: 'Current Location',
        country: '',
        state: '',
        latitude: location.latitude,
        longitude: location.longitude,
        isCurrent: true,
        isFavorite: false,
        searchCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      dispatch(setCurrentLocation(locationObj));
      dispatch(setSelectedLocation(locationObj)); // Also set as selected location so map updates
      
      if (__DEV__) {
      }
      
      await loadWeatherData(location);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get current location';
      errorLogger.error('Error getting current location', err as Error, 'WeatherScreen', {
        action: 'getCurrentLocation',
        errorType: err instanceof Error ? err.constructor.name : 'Unknown'
      });
      setError(errorMessage);
      setSnackbarVisible(true);
    }
  }, [getCurrentLocation, loadWeatherData, dispatch]);

  // Load favorite locations with performance optimization
  const loadFavoriteLocations = useCallback(async () => {
    if (!dbInitialized) return;
    
    const startTime = performance.now();
    
    try {
      setFavoritesLoading(true);
      const user = await userService.getCurrentUser();
      const favorites = await offlineCacheService.getFavoriteLocations(user.id);
      // if (__DEV__) {
      //   console.log('Loaded favorites:', favorites.map(f => f.name).join(', '));
      // }
      setFavoriteLocations(favorites);
      
      if (favorites.length === 0) {
        setFavoriteWeatherData({});
        return;
      }
      
      // Process all favorites concurrently with proper error handling
      const weatherData: Record<string, any> = {};
      
      // Create all weather requests at once
      const weatherPromises = (favorites || []).map(async (location) => {
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
      (weatherResults || []).forEach((result) => {
        if (result.status === 'fulfilled' && result.value.weather) {
          weatherData[result.value.locationId] = result.value.weather;
        }
      });
      
      setFavoriteWeatherData(weatherData);
      lastFavoritesLoadTime.current = Date.now();
    } catch (error) {
      console.error('Error loading favorite locations:', error);
    } finally {
      setFavoritesLoading(false);
      
      // Only log if it took longer than 100ms
      const duration = performance.now() - startTime;
      if (__DEV__ && duration > 100) {
      }
    }
  }, [dbInitialized]);

  // Helper function to convert string dates back to Date objects
  const convertLocationDates = useCallback((location: Location): Location => {
    const converted = { ...location };
    if (converted.lastSearched && typeof converted.lastSearched === 'string') {
      converted.lastSearched = new Date(converted.lastSearched);
    }
    if (converted.createdAt && typeof converted.createdAt === 'string') {
      converted.createdAt = new Date(converted.createdAt);
    }
    if (converted.updatedAt && typeof converted.updatedAt === 'string') {
      converted.updatedAt = new Date(converted.updatedAt);
    }
    return converted;
  }, []);

  // Helper function to update last searched time for a location
  const updateLastSearched = useCallback(async (location: Location) => {
    try {
      // Check if database is ready before attempting to update
      if (!dbInitialized) {
        if (__DEV__) {
          console.log('Database not ready, skipping location update for:', location.name);
        }
        return;
      }
      
      if (location.id && !location.id.startsWith('current-') && !location.id.startsWith('search-')) {
        // Only update for saved locations (not current location or search results)
        if (__DEV__) {
          console.log('Updating lastSearched for:', location.name);
        }
        await locationRepository.updateLocation(location.id, {
          lastSearched: new Date(),
        });
      }
    } catch (error) {
      console.error('Error updating last searched time:', error);
    }
  }, [dbInitialized]);

  // Handle favorite location selection
  const handleFavoriteLocationSelect = useCallback(async (location: Location) => {
    // if (__DEV__) {
    //   console.log('Favorite location selected:', location.name);
    // }
    dispatch(setSelectedLocation(location));
    await updateLastSearched(location);
    // Reload favorites to update the order
    await loadFavoriteLocations();
    const locationCoords: LocationCoordinates = {
      latitude: location.latitude,
      longitude: location.longitude,
    };
    loadWeatherData(locationCoords);
  }, [loadWeatherData, dispatch, updateLastSearched, loadFavoriteLocations]);

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
        // Skip database wait entirely to prevent hanging
        // if (dbInitializing) {
        //   // Wait for database to be ready, but with a shorter timeout
        //   const maxWaitTime = 500; // 500ms max (reduced from 2000ms)
        //   const checkInterval = 50; // Check every 50ms (reduced from 100ms)
        //   let waited = 0;
        //   
        //   while (dbInitializing && waited < maxWaitTime) {
        //     await new Promise(resolve => setTimeout(resolve, checkInterval));
        //     waited += checkInterval;
        //   }
        // }
        
        setIsInitializing(false);
        
        // Check if we already have a selected location from storage
        const savedSelectedLocation = await storageService.getSelectedLocation();
        
        if (savedSelectedLocation) {
          // Convert string dates back to Date objects if needed
          const convertedLocation = convertLocationDates(savedSelectedLocation);
          
          // We have a saved location, use it instead of getting current location
          dispatch(setSelectedLocation(convertedLocation));
          await updateLastSearched(convertedLocation);
          const hasCached = await fastInitialize(convertedLocation.latitude, convertedLocation.longitude);
          setHasCachedData(hasCached);
          await loadWeatherData({
            latitude: convertedLocation.latitude,
            longitude: convertedLocation.longitude,
          });
        } else {
          // No saved location, try current location first with a safe timeout
          console.log('📍 No saved location found, attempting to get current location...');

          const getCurrentLocationWithTimeout = async (timeoutMs: number) => {
            return new Promise<{ location?: LocationCoordinates; timedOut?: boolean; error?: any }>((resolve) => {
              const timeoutId = setTimeout(() => resolve({ timedOut: true }), timeoutMs);
              getCurrentLocation()
                .then(loc => {
                  clearTimeout(timeoutId);
                  resolve({ location: loc });
                })
                .catch(error => {
                  clearTimeout(timeoutId);
                  resolve({ error });
                });
            });
          };

          const result = await getCurrentLocationWithTimeout(15000); // 15s for physical devices

          if (result.location) {
            const location = result.location;
            console.log('📍 Current location obtained:', location);

            const locationObj: Location = {
              id: `current-${location.latitude}-${location.longitude}`,
              name: 'Current Location',
              country: '',
              state: '',
              latitude: location.latitude,
              longitude: location.longitude,
              isCurrent: true,
              isFavorite: false,
              searchCount: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            dispatch(setCurrentLocation(locationObj));
            dispatch(setSelectedLocation(locationObj));

            const hasCached = await fastInitialize(location.latitude, location.longitude);
            setHasCachedData(hasCached);
            await loadWeatherData(location);
          } else if (result.timedOut) {
            console.warn('📍 Location timed out; preserving current selection and skipping fallback');
            // Do not override with fallback on timeout; user may already have a valid selection
          } else if (result.error) {
            console.warn('📍 Location failed, using fallback due to error:', result.error);
            // Use a fallback location (London) only on actual error
            const fallbackLocation: LocationCoordinates = { latitude: 51.5074, longitude: -0.1278 };
            const fallbackLocationObj: Location = {
              id: `fallback-${fallbackLocation.latitude}-${fallbackLocation.longitude}`,
              name: 'London (Fallback)',
              country: 'GB',
              state: '',
              latitude: fallbackLocation.latitude,
              longitude: fallbackLocation.longitude,
              isCurrent: false,
              isFavorite: false,
              searchCount: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            dispatch(setCurrentLocation(fallbackLocationObj));
            dispatch(setSelectedLocation(fallbackLocationObj));
            const hasCached = await fastInitialize(fallbackLocation.latitude, fallbackLocation.longitude);
            setHasCachedData(hasCached);
            await loadWeatherData(fallbackLocation);
          }
        }
      } finally {
        // Only log if it took longer than 100ms
        const duration = performance.now() - startTime;
        if (__DEV__ && duration > 100) {
        }
      }
    };
    
    initApp();
  }, []); // Run only once on mount to prevent infinite loop

  // Handle search params changes - with infinite loop protection
  useEffect(() => {
    const processSearchParams = async () => {
      if (hasSearchParams && !isInitializing) {
        // Check if we've already processed these search params to prevent infinite loop
        const currentSearchKey = `${searchParams.latitude}-${searchParams.longitude}`;
        if (processedSearchParams.current === currentSearchKey) {
          return; // Already processed these params
        }
        
        try {
          const lat = parseFloat(searchParams.latitude as string);
          const lon = parseFloat(searchParams.longitude as string);
          
          if (!isNaN(lat) && !isNaN(lon)) {
            const location: LocationCoordinates = {
              latitude: lat,
              longitude: lon,
            };
            
            // Mark as processed before setting state to prevent infinite loop
            processedSearchParams.current = currentSearchKey;
            
            // Create a Location object for Redux
            const locationObj: Location = {
              id: `search-${lat}-${lon}`,
              name: searchParams.name as string || 'Unknown Location',
              country: searchParams.country as string || '',
              state: searchParams.state as string || '',
              latitude: lat,
              longitude: lon,
              isCurrent: false,
              isFavorite: false,
              searchCount: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            
            dispatch(setSelectedLocation(locationObj));
            
            console.log('🗺️ Map should update to:', location.latitude, location.longitude);
            
            // Use fastLoadWeather for immediate display with background refresh
            await fastLoadWeather(location.latitude, location.longitude);
          }
        } catch (err) {
          console.error('Error loading search location:', err);
        }
      }
    };
    
    processSearchParams();
  }, [hasSearchParams, searchKey, isInitializing, searchParams]);


  // Load favorites when database is ready
  useEffect(() => {
    loadFavoriteLocations();
  }, []); // Function is stable, no need for dependency

  // Persist selected location when it changes
  useEffect(() => {
    const saveSelectedLocation = async () => {
      if (selectedLocation) {
        try {
          // if (__DEV__) {
          //   console.log('Saving location to storage:', selectedLocation.name);
          // }
          await storageService.saveSelectedLocation(selectedLocation);
          // errorLogger.info('Selected location saved successfully', 'WeatherScreen', {
          //   locationId: selectedLocation.id,
          //   locationName: selectedLocation.name
          // });
        } catch (err) {
          console.error('Failed to save selected location to storage:', err);
          errorLogger.error('Failed to save selected location', err as Error, 'WeatherScreen', {
            locationId: selectedLocation.id,
            locationName: selectedLocation.name
          });
        }
      }
    };
    
    saveSelectedLocation();
  }, [selectedLocation]);

  // Reload favorites and restore selected location when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const restoreLocationAndLoadFavorites = async () => {
        // If we have search params, let the dedicated effect handle them and avoid overriding
        if (hasSearchParams) {
          return;
        }
        if (dbInitialized) {
          const now = Date.now();
          // Only reload if it's been more than 2 seconds since last load
          if (now - lastFavoritesLoadTime.current > 2000) {
            // if (__DEV__) {
            //   console.log('Reloading favorites on focus');
            // }
            loadFavoriteLocations();
            lastFavoritesLoadTime.current = now;
          }
        }
        
        // Check if we have search parameters first (from navigation)
        if (hasSearchParams && !hasProcessedSearchParams) {
          const lat = parseFloat(searchParams.latitude as string);
          const lon = parseFloat(searchParams.longitude as string);
          
          if (!isNaN(lat) && !isNaN(lon)) {
            // Check if these coordinates are significantly different from current selected location
            const isSignificantlyDifferent = !selectedLocation || 
              Math.abs(selectedLocation.latitude - lat) > 0.1 || 
              Math.abs(selectedLocation.longitude - lon) > 0.1;
            
            if (isSignificantlyDifferent) {
              if (__DEV__) {
                console.log('Search parameters differ significantly from selected location, updating...');
              }
            const locationObj: Location = {
              id: `search-${lat}-${lon}`,
              name: searchParams.name as string || 'Unknown Location',
              country: searchParams.country as string || '',
              state: searchParams.state as string || '',
              latitude: lat,
              longitude: lon,
              isCurrent: false,
              isFavorite: false,
              searchCount: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            // if (__DEV__) {
            //   console.log('Loading location from search:', locationObj.name);
            // }
            dispatch(setSelectedLocation(locationObj));
            await updateLastSearched(locationObj);
            
            // Load weather for the search location
            const hasCached = await fastInitialize(lat, lon);
            setHasCachedData(hasCached);
            await loadWeatherData({ latitude: lat, longitude: lon });
            
            // errorLogger.info('Location restored from search parameters on focus', 'WeatherScreen', {
            //   locationId: locationObj.id,
            //   locationName: locationObj.name
            // });
            
            // Mark search parameters as processed to prevent them from being processed again
            setHasProcessedSearchParams(true);
            if (__DEV__) {
              console.log('Search parameters processed and marked as complete');
            }
            
            return; // Exit early since we processed search params
            } else {
              if (__DEV__) {
                console.log('Search parameters are similar to selected location, ignoring...');
              }
              setHasProcessedSearchParams(true);
              return; // Exit early since we're ignoring similar coordinates
            }
          }
        }
        
        // If no search params, try to restore from storage
        try {
          const savedSelectedLocation = await storageService.getSelectedLocation();
          if (savedSelectedLocation) {
            // if (__DEV__) {
            //   console.log('Restoring saved location:', savedSelectedLocation.name);
            // }
            
            // Convert string dates back to Date objects if needed
            const convertedLocation = convertLocationDates(savedSelectedLocation);
            
            dispatch(setSelectedLocation(convertedLocation));
            await updateLastSearched(convertedLocation);
            
            // Use fastLoadWeather for immediate display with background refresh
            if (__DEV__) {
              console.trace('🔍 fastLoadWeather call stack');
            }
            await fastLoadWeather(convertedLocation.latitude, convertedLocation.longitude);
            // errorLogger.info('Selected location restored from storage on focus', 'WeatherScreen', {
            //   locationId: convertedLocation.id,
            //   locationName: convertedLocation.name
            // });
          } else {
            // if (__DEV__) {
            //   console.log('No saved location, loading current location...');
            // }
            // Fallback to current location if no saved location
            try {
              const location = await getCurrentLocation();
              if (location) {
                const locationObj: Location = {
                  id: `current-${location.latitude}-${location.longitude}`,
                  name: 'Current Location',
                  country: '',
                  state: '',
                  latitude: location.latitude,
                  longitude: location.longitude,
                  isCurrent: true,
                  isFavorite: false,
                  searchCount: 0,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };
                
                // if (__DEV__) {
                //   console.log('Loading current location:', locationObj.name);
                // }
                dispatch(setCurrentLocation(locationObj));
                dispatch(setSelectedLocation(locationObj));
                
                // Use fastLoadWeather for immediate display with background refresh
                if (__DEV__) {
                  console.trace('🔍 fastLoadWeather call stack');
                }
                await fastLoadWeather(location.latitude, location.longitude);
                
                // errorLogger.info('Current location loaded as fallback on focus', 'WeatherScreen', {
                //   locationId: locationObj.id,
                //   locationName: locationObj.name
                // });
              } else {
                // If no current location, use fallback
                const fallbackLocation: LocationCoordinates = {
                  latitude: 51.5074,
                  longitude: -0.1278,
                };
                
                const fallbackLocationObj: Location = {
                  id: `fallback-${fallbackLocation.latitude}-${fallbackLocation.longitude}`,
                  name: 'London (Fallback)',
                  country: 'GB',
                  state: '',
                  latitude: fallbackLocation.latitude,
                  longitude: fallbackLocation.longitude,
                  isCurrent: false,
                  isFavorite: false,
                  searchCount: 0,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };
                
                dispatch(setCurrentLocation(fallbackLocationObj));
                dispatch(setSelectedLocation(fallbackLocationObj));
                
                // Use fastLoadWeather for immediate display with background refresh
                if (__DEV__) {
                  console.trace('🔍 fastLoadWeather call stack');
                }
                await fastLoadWeather(fallbackLocation.latitude, fallbackLocation.longitude);
              }
            } catch (err) {
              console.error('Error loading current location as fallback:', err);
            }
          }
        } catch (err) {
          console.error('Error retrieving saved location from storage:', err);
          errorLogger.error('Failed to restore selected location on focus', err as Error, 'WeatherScreen', {
            action: 'restoreLocationOnFocus'
          });
        }
      };
      
      restoreLocationAndLoadFavorites();
    }, [dbInitialized, hasSearchParams, searchParams.latitude, searchParams.longitude]) // Minimal dependencies to prevent infinite loop
  );



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
          <FloatingFAB
            icon="refresh"
            label="Restart App"
            onPress={() => {
              const { router } = require('expo-router');
              router.replace('/(tabs)/');
            }}
            testID="floating-fab-restart-app"
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
        </View>
        <FloatingFAB
          icon="map-marker"
          label="Enable Location"
          onPress={handleLocationPress}
          testID="floating-fab-enable-location"
        />
      </View>
    );
  }

  // Show location error screen if we have permission but no weather data
  if (permissionStatus.status === 'granted' && !currentWeather && !isLoading && !isInitializing) {
    return (
      <View style={themeStyles.container} key={`location-error-${effectiveTheme}`}>
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
              title={
                isGettingCurrentLocation 
                  ? "Getting your current location..." 
                  : refreshing 
                    ? "Refreshing weather..." 
                    : !networkIsOnline && !hasCachedData
                      ? "No internet connection"
                      : "Pull to refresh"
              }
              titleColor={theme.colors.onSurface}
              progressViewOffset={80}
            />
          }
          showsVerticalScrollIndicator={false}
          bounces={true}
          alwaysBounceVertical={true}
        >
          <View style={styles.permissionContainer}>
            <Text variant="headlineSmall" style={[styles.permissionTitle, themeStyles.onSurface]}>
              Location Error
            </Text>
            <Text variant="bodyLarge" style={[styles.permissionMessage, themeStyles.onSurface]}>
              Unable to get your current location. This might be due to poor GPS signal or network issues.
            </Text>
            <Text variant="bodyMedium" style={[styles.permissionSubtext, themeStyles.onSurfaceVariant]}>
              Try again or search for a location manually.
            </Text>
          </View>
        </ScrollView>
        {/* Use floating FAB so it appears bottom-right consistently on Android/iOS */}
        <FloatingFAB
          icon="magnify"
          label="Search Location"
          onPress={() => router.push('/search')}
          testID="floating-fab-search-location"
        />
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

  // Show loading if we're still initializing and have no weather data
  if (isInitializing && !currentWeather) {
    return (
      <View style={themeStyles.container} key={`initializing-${effectiveTheme}`}>
        <LoadingSpinner 
          message="Initializing SkyePie..." 
          progress={0.5}
          showProgress={true}
        />
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
          <FloatingFAB
            icon="refresh"
            label="Try Again"
            onPress={handleLocationPress}
            testID="floating-fab-try-again"
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
      {isOffline && hasCachedData && (
        <View style={[styles.modernOfflineIndicator, { backgroundColor: theme.colors.warning + '20' }]}>
          <Text variant="labelMedium" style={[styles.modernOfflineText, { color: theme.colors.warning }]}>
            📡 Showing cached data (offline)
          </Text>
        </View>
      )}

      {/* Offline with no cached data */}
      {isOffline && !hasCachedData && (
        <View style={[styles.modernOfflineIndicator, { backgroundColor: theme.colors.error + '20' }]}>
          <Text variant="labelMedium" style={[styles.modernOfflineText, { color: theme.colors.error }]}>
            📡 No internet connection and no cached data
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
            title={
              isGettingCurrentLocation 
                ? "Getting your current location..." 
                : refreshing 
                  ? "Refreshing weather..." 
                  : !networkIsOnline && !hasCachedData
                    ? "No internet connection"
                    : "Pull to refresh"
            }
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
          <Animated.View 
            style={[
              styles.weatherDisplayContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
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
                sunrise={processedWeatherData.sunrise}
                sunset={processedWeatherData.sunset}
                timezone={processedWeatherData.timezone}
              />
              {displayPreferences.showFeelsLike && (
                <Text variant="titleMedium" style={[styles.feelsLike, { color: theme.colors.onSurfaceVariant }]}>
                  Feels like {formatTemperature(processedWeatherData.feelsLike, units.temperature)}
                </Text>
              )}
            </View>

            {/* Weather details - no card container */}
            <View style={styles.weatherDetailsContainer}>
              <View style={styles.detailsGrid}>
                {displayPreferences.showHumidity && (
                  <View style={styles.detailItem}>
                    <Text variant="labelMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Humidity
                    </Text>
                    <Text variant="titleMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                      {formatHumidity(processedWeatherData.humidity)}
                    </Text>
                  </View>
                )}
                
                {displayPreferences.showWindSpeed && (
                  <View style={styles.detailItem}>
                    <Text variant="labelMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Wind
                    </Text>
                    <Text variant="titleMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                      {formatWindSpeed(processedWeatherData.windSpeed, units.windSpeed)}
                    </Text>
                  </View>
                )}
                
                {displayPreferences.showRainfall && (
                  <View style={styles.detailItem}>
                    <Text variant="labelMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Rainfall
                    </Text>
                    <Text variant="titleMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                      {formatRainfall(processedWeatherData.rainfall, units.rainfall)}
                    </Text>
                  </View>
                )}
                
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
          </Animated.View>
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
                    Hourly Forecast
                  </Text>
                  <View style={styles.forecastToggleContainer}>
                  <SegmentedButtons
                    value={showHourlyForecast ? 'hourly' : 'daily'}
                    onValueChange={handleForecastToggle}
                    buttons={[
                      {
                        value: 'hourly',
                        label: 'Hourly',
                        icon: 'clock-outline',
                      },
                      {
                        value: 'daily',
                        label: 'Weekly',
                        icon: 'calendar-today',
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
                <View style={styles.hourlyContainer}>
                  {processedForecast.hourly.map((item, index) => (
                    <View key={`${item.dt}-${index}`} style={styles.hourlyItem}>
                      <Text variant="bodySmall" style={[styles.hourlyTime, { color: theme.colors.onSurface }]}>
                        {formatTime(item.dt)}
                      </Text>
                      <WeatherIcon condition={item.weather[0]} size={32} />
                      <TemperatureDisplay
                        temperature={item.main.temp}
                        unit={units.temperature}
                        size="small"
                        showUnit={false}
                        color={theme.colors.onSurface}
                      />
                      <Text variant="bodySmall" style={[styles.hourlyDesc, { color: theme.colors.onSurfaceVariant }]}>
                        {item.weather[0]?.description || ''}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.dailyForecastContainer}>
                <View style={styles.forecastHeaderContainer}>
                  <Text variant="titleLarge" style={[styles.forecastSectionTitle, { color: theme.colors.onSurface }]}>
                    Weekly Forecast
                  </Text>
                  <View style={styles.forecastToggleContainer}>
                  <SegmentedButtons
                    value={showHourlyForecast ? 'hourly' : 'daily'}
                    onValueChange={handleForecastToggle}
                    buttons={[
                      {
                        value: 'hourly',
                        label: 'Hourly',
                        icon: 'clock-outline',
                      },
                      {
                        value: 'daily',
                        label: 'Weekly',
                        icon: 'calendar-today',
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
                  {processedForecast.daily
                    .map((item, index) => (
                      <View key={`${item.dt}-${index}`} style={styles.dailyItem}>
                        <Text variant="bodySmall" style={[styles.dailyName, { color: theme.colors.onSurface }]}>
                          {item.dayName}
                        </Text>
                        <WeatherIcon condition={item.weatherIcon} size={32} />
                        <View style={styles.dailyTemps}>
                          <View style={styles.dailyHighContainer}>
                            <Text variant="bodySmall" style={[styles.dailyLabel, { color: theme.colors.onSurface }]}>
                              H:
                            </Text>
                            <TemperatureDisplay
                              temperature={item.dailyHigh}
                              unit={units.temperature}
                              size="small"
                              showUnit={false}
                              color={theme.colors.onSurface}
                            />
                          </View>
                          <View style={styles.dailyLowContainer}>
                            <Text variant="bodySmall" style={[styles.dailyLabel, { color: theme.colors.onSurfaceVariant }]}>
                              L:
                            </Text>
                            <TemperatureDisplay
                              temperature={item.dailyLow}
                              unit={units.temperature}
                              size="small"
                              showUnit={false}
                              color={theme.colors.onSurfaceVariant}
                            />
                          </View>
                        </View>
                      </View>
                    ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Weather Map Section */}
        {locationToUse && isApiKeyConfigured && (
          <View style={styles.weatherMapContainer}>
            <WeatherMap
              key={`weather-map-${locationToUse.latitude}-${locationToUse.longitude}-${mapRefreshKey}`}
              center={{
                lat: locationToUse.latitude,
                lon: locationToUse.longitude,
              }}
              zoom={8}
              apiKey={API_KEY}
              showLegend={true}
            />
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
                        <TouchableOpacity onPress={() => handleFavoriteLocationSelect(location)}>
                          <Text 
                            variant="titleMedium" 
                            style={[styles.favoriteName, { color: theme.colors.onSurface }]}
                          >
                            {location.name}
                          </Text>
                        </TouchableOpacity>
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
                          <TemperatureDisplay
                            temperature={weather.main.temp}
                            unit={units.temperature}
                            size="small"
                            sunrise={weather.sys?.sunrise}
                            sunset={weather.sys?.sunset}
                            timezone={weather.timezone}
                          />
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

      {/* Modern FAB - only show when we have weather data */}
      {processedWeatherData && (
        <FloatingFAB
          icon="map-marker"
          onPress={handleLocationPress}
          backgroundColor={theme.colors.primary}
          color={theme.colors.onPrimary}
          testID="floating-fab-current-location"
        />
      )}

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
  weatherMapContainer: {
    marginHorizontal: 36, // Match forecastHeaderContainer
    marginBottom: 24,
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
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
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
    right: 20,
    bottom: 20,
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
    right: 16,
    bottom: 16,
  },
  fabOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
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
  hourlyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  hourlyScrollContent: {
    paddingHorizontal: 0, // No padding - cards float off screen edges
  },
  dailyScrollContent: {
    paddingHorizontal: 0, // No padding - cards float off screen edges
  },
  hourlyItem: {
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2, // Reduced margin between items
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
  dailyHighContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dailyLowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dailyLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginRight: 2,
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
    paddingVertical: 16,
    paddingLeft: 16,
    paddingRight: 4, // Reduced right padding to bring button closer to edge
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
    gap: 8,
  },
  favoriteTemp: {
    marginLeft: 8,
    fontWeight: '600',
  },
  removeFavoriteButton: {
    marginLeft: 8,
    marginRight: 0, // No right margin since we reduced card padding
    paddingHorizontal: 2, // Minimal internal padding
    minWidth: 28, // Even smaller minimum width
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
