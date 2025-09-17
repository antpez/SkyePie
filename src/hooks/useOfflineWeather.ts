import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CurrentWeather, WeatherForecast, TemperatureUnit, Location, WeatherAlert } from '../types';
import { createWeatherService } from '../services';
import { offlineCacheService, userService } from '../services';
import { APP_CONFIG } from '../config/app';
import { useNetworkStatus } from './useNetworkStatus';
import { NetworkError } from '../types/networkErrors';
import { performanceMonitor } from '../utils/performanceMonitor';

/**
 * useOfflineWeather - Custom hook for weather data with offline support
 * Provides weather data fetching, caching, and offline functionality
 * @param apiKey - OpenWeatherMap API key
 * @returns Weather data, loading states, and fetch functions
 */
export const useOfflineWeather = (apiKey?: string) => {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<NetworkError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Network status monitoring
  const { isOnline, isSlowConnection, refreshNetworkStatus } = useNetworkStatus();

  // Sync offline state with network status - only set offline if we're actually offline
  useEffect(() => {
    // Only set offline if we're actually offline, not just during data refresh
    if (!isOnline) {
      setIsOffline(true);
    } else {
      // Only set online if we're not currently loading fresh data
      if (!isLoading) {
        setIsOffline(false);
      }
    }
  }, [isOnline, isLoading]);

  // Memoize weather service creation to prevent recreation
  const weatherService = useMemo(() => {
    if (apiKey && apiKey !== 'your_api_key_here' && apiKey !== '') {
      return createWeatherService(apiKey);
    }
    return null;
  }, [apiKey]);

  // Ref to store user ID and prevent re-initialization
  const userIdRef = useRef<string | null>(null);
  const initializingUser = useRef(false);

  // Helper function to ensure user is initialized and get current user ID
  const ensureUserInitialized = useCallback(async (): Promise<string> => {
    if (userIdRef.current) return userIdRef.current;
    
    // Prevent multiple simultaneous calls
    if (initializingUser.current) {
      // Wait a bit and try again
      await new Promise(resolve => setTimeout(resolve, 100));
      if (userIdRef.current) return userIdRef.current;
    }
    
    initializingUser.current = true;
    try {
      const user = await userService.getCurrentUser();
      userIdRef.current = user.id;
      // Always set state to ensure consistency
      setUserId(user.id);
      return user.id;
    } catch (error) {
      console.error('Error initializing user:', error);
      throw new Error('User initialization failed');
    } finally {
      initializingUser.current = false;
    }
  }, []);

  // Helper function to create location object
  const createLocationObject = useCallback((userId: string, latitude: number, longitude: number): Omit<Location, 'id' | 'createdAt' | 'updatedAt'> => ({
    userId,
    name: 'Current Location',
    country: '',
    latitude,
    longitude,
    isCurrent: true,
    isFavorite: false,
    searchCount: 0,
    lastSearched: new Date(),
  }), []);

  // Initialize user - optimized with better error handling and memory leak prevention
  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout | null = null;
    
    const initUser = async () => {
      try {
        // Add a small delay to ensure database is initialized
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!isMounted) return;
        
        const user = await userService.getCurrentUser();
        if (isMounted) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        // Retry after a longer delay
        retryTimeout = setTimeout(async () => {
          if (!isMounted) return;
          try {
            const user = await userService.getCurrentUser();
            if (isMounted) {
              setUserId(user.id);
            }
          } catch (retryError) {
            console.error('Error retrying user initialization:', retryError);
          }
        }, 2000);
      }
    };
    
    initUser();
    
    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
        retryTimeout = null;
      }
    };
  }, []); // Empty dependency array to prevent re-initialization

  const fetchCurrentWeather = useCallback(async (
    latitude: number, 
    longitude: number,
    units: TemperatureUnit = 'celsius',
    forceRefresh: boolean = false
  ) => {
    if (!weatherService) {
      throw new Error('Weather service not initialized. Please provide an API key.');
    }

    const startTime = performance.now();
    
    try {
      // Don't set loading to true immediately - show cached data first
      if (!forceRefresh) {
        // Try to get cached data first and show it immediately
        try {
          const currentUserId = await ensureUserInitialized();
          const location = createLocationObject(currentUserId, latitude, longitude);
          const cachedWeather = await offlineCacheService.getCachedCurrentWeather(location, currentUserId);
          if (cachedWeather) {
            setCurrentWeather(cachedWeather);
            setLastUpdated(new Date());
            // Only set offline if we're actually offline, not just using cached data
            if (!isOnline) {
              setIsOffline(true);
            }
            // Continue to fetch fresh data in background
          }
        } catch (cacheError) {
          console.warn('Error loading cached weather:', cacheError);
        }
      }

      // Set loading only when fetching fresh data
      setIsLoading(true);
      setError(null);

      // Ensure user is initialized
      const currentUserId = await ensureUserInitialized();
      const location = createLocationObject(currentUserId, latitude, longitude);

      // Fetch fresh data from API
      const weather = await weatherService.getCurrentWeather(
        latitude, 
        longitude, 
        units === 'fahrenheit' ? 'imperial' : 'metric'
      );

      setCurrentWeather(weather);
      setLastUpdated(new Date());
      // Only set online if we're actually online
      if (isOnline) {
        setIsOffline(false);
      }

      // Cache the weather data
      await offlineCacheService.cacheCurrentWeather(location, weather, currentUserId);

      return weather;
    } catch (err) {
      // Handle network errors
      if (err && typeof err === 'object' && 'type' in err) {
        const networkErr = err as NetworkError;
        setNetworkError(networkErr);
        setError(networkErr.message);
        
        // If it's a network error and we're offline, try cached data
        if (networkErr.type === 'CONNECTION_ERROR' || !isOnline) {
          setIsOffline(true);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
        setError(errorMessage);
      }

      // If API fails, try to get cached data
      if (!forceRefresh) {
        try {
          const currentUserId = await ensureUserInitialized();
          const location = createLocationObject(currentUserId, latitude, longitude);
          const cachedWeather = await offlineCacheService.getCachedCurrentWeather(location, currentUserId);
          
          if (cachedWeather) {
            setCurrentWeather(cachedWeather);
            setLastUpdated(new Date());
            // Only set offline if we're actually offline, not just using cached data
            if (!isOnline) {
              setIsOffline(true);
            }
            return cachedWeather;
          }
        } catch (cacheError) {
          console.error('Error loading cached weather:', cacheError);
        }
      }

      throw err;
    } finally {
      setIsLoading(false);
      
      // Performance monitoring - removed to reduce log spam
    }
  }, [weatherService, createLocationObject]);

  const fetchForecast = useCallback(async (
    latitude: number, 
    longitude: number,
    units: TemperatureUnit = 'celsius',
    forceRefresh: boolean = false
  ) => {
    if (!weatherService) {
      throw new Error('Weather service not initialized. Please provide an API key.');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Ensure user is initialized
      const currentUserId = await ensureUserInitialized();
      const location = createLocationObject(currentUserId, latitude, longitude);

      // Try to get cached data first (unless forcing refresh)
      if (!forceRefresh) {
        const cachedForecast = await offlineCacheService.getCachedWeatherForecast(location, currentUserId);
        if (cachedForecast) {
          setForecast(cachedForecast);
          setLastUpdated(new Date());
          // Only set offline if we're actually offline, not just using cached data
          if (!isOnline) {
            setIsOffline(true);
          }
          return cachedForecast;
        }
      }

      // Fetch fresh data from API
      const forecastData = await weatherService.getWeatherForecast(
        latitude, 
        longitude, 
        units === 'fahrenheit' ? 'imperial' : 'metric'
      );

      setForecast(forecastData);
      setLastUpdated(new Date());
      // Only set online if we're actually online
      if (isOnline) {
        setIsOffline(false);
      }

      // Cache the forecast data
      await offlineCacheService.cacheWeatherForecast(location, forecastData, currentUserId);

      return forecastData;
    } catch (err) {
      // If API fails, try to get cached data
      if (!forceRefresh) {
        try {
          const currentUserId = await ensureUserInitialized();
          const location = createLocationObject(currentUserId, latitude, longitude);
          const cachedForecast = await offlineCacheService.getCachedWeatherForecast(location, currentUserId);
          
          if (cachedForecast) {
            setForecast(cachedForecast);
            setLastUpdated(new Date());
            // Only set offline if we're actually offline, not just using cached data
            if (!isOnline) {
              setIsOffline(true);
            }
            return cachedForecast;
          }
        } catch (cacheError) {
          console.error('Error loading cached forecast:', cacheError);
        }
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch forecast data';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [weatherService, createLocationObject]);

  const searchLocations = useCallback(async (query: string) => {
    if (!weatherService) {
      throw new Error('Weather service not initialized. Please provide an API key.');
    }

    try {
      setError(null);

      // Ensure user is initialized
      const currentUserId = await ensureUserInitialized();
      
      // Try to get cached results first
      const cachedResults = await offlineCacheService.getCachedLocationSearch(query, currentUserId);
      if (cachedResults.length > 0) {
        return cachedResults;
      }

      // Fetch fresh data from API
      const results = await weatherService.searchLocations(query);
      
      // Cache the results
      await offlineCacheService.cacheLocationSearch(query, results, currentUserId);

      return results;
    } catch (err) {
      // If API fails, try to get cached results
      try {
        const currentUserId = await ensureUserInitialized();
        const cachedResults = await offlineCacheService.getCachedLocationSearch(query, currentUserId);
        if (cachedResults.length > 0) {
          return cachedResults;
        }
      } catch (cacheError) {
        console.error('Error loading cached search results:', cacheError);
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to search locations';
      setError(errorMessage);
      throw err;
    }
  }, [weatherService]);

  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    if (!weatherService) {
      throw new Error('Weather service not initialized');
    }

    try {
      setError(null);
      return await weatherService.reverseGeocode(latitude, longitude);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reverse geocode';
      setError(errorMessage);
      throw err;
    }
  }, [weatherService]);

  const fetchAlerts = useCallback(async (latitude: number, longitude: number) => {
    if (!weatherService) {
      throw new Error('Weather service not initialized. Please provide an API key.');
    }

    try {
      setError(null);
      const alertsData = await weatherService.getWeatherAlerts(latitude, longitude);
      setAlerts(alertsData);
      setLastUpdated(new Date());
      // Only set online if we're actually online
      if (isOnline) {
        setIsOffline(false);
      }
      return alertsData;
    } catch (err) {
      console.error('Error fetching weather alerts:', err);
      // Alerts are optional, so we don't throw an error
      setAlerts([]);
      return [];
    }
  }, [weatherService]);

  const refreshWeather = useCallback(async (
    latitude: number, 
    longitude: number,
    units: TemperatureUnit = 'celsius'
  ) => {
    try {
      // Use Promise.allSettled to prevent one failure from stopping others
      const results = await Promise.allSettled([
        fetchCurrentWeather(latitude, longitude, units, true),
        fetchForecast(latitude, longitude, units, true),
        // Temporarily disable alerts to prevent infinite loop
        // fetchAlerts(latitude, longitude),
      ]);
      
      // Log any failures but don't throw
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const operation = ['current weather', 'forecast'][index];
          console.warn(`Failed to refresh ${operation}:`, result.reason);
        }
      });
    } catch (err) {
      console.error('Error refreshing weather:', err);
      throw err;
    }
  }, []);

  const loadCachedWeather = useCallback(async (latitude: number, longitude: number) => {
    try {
      // Ensure user is initialized
      const currentUserId = await ensureUserInitialized();
      const location = createLocationObject(currentUserId, latitude, longitude);

      const cachedWeather = await offlineCacheService.getCachedCurrentWeather(location, currentUserId);
      if (cachedWeather) {
        setCurrentWeather(cachedWeather);
        setLastUpdated(new Date());
        // Only set offline if we're actually offline, not just using cached data
        if (!isOnline) {
          setIsOffline(true);
        }
        return cachedWeather;
      }
    } catch (err) {
      console.error('Error loading cached weather:', err);
    }
    return null;
  }, [createLocationObject]);

  

  const loadCachedForecast = useCallback(async (latitude: number, longitude: number) => {
    try {
      // Ensure user is initialized
      const currentUserId = await ensureUserInitialized();
      const location = createLocationObject(currentUserId, latitude, longitude);

      const cachedForecast = await offlineCacheService.getCachedWeatherForecast(location, currentUserId);
      if (cachedForecast) {
        setForecast(cachedForecast);
        setLastUpdated(new Date());
        // Only set offline if we're actually offline, not just using cached data
        if (!isOnline) {
          setIsOffline(true);
        }
        return cachedForecast;
      }
    } catch (err) {
      console.error('Error loading cached forecast:', err);
    }
    return null;
  }, [createLocationObject]);

  // Fast load function that shows cached data immediately and refreshes in background
  const fastLoadWeather = useCallback(async (
    latitude: number, 
    longitude: number,
    units: TemperatureUnit = 'celsius'
  ) => {
    try {
      // Load cached data first for immediate display
      const [cachedWeather, cachedForecast] = await Promise.allSettled([
        loadCachedWeather(latitude, longitude),
        loadCachedForecast(latitude, longitude),
      ]);

      // If we have cached data, show it immediately
      if (cachedWeather.status === 'fulfilled' && cachedWeather.value) {
        setCurrentWeather(cachedWeather.value);
        setLastUpdated(new Date());
      }
      if (cachedForecast.status === 'fulfilled' && cachedForecast.value) {
        setForecast(cachedForecast.value);
        setLastUpdated(new Date());
      }

      // Then refresh with fresh data in background
      const results = await Promise.allSettled([
        fetchCurrentWeather(latitude, longitude, units, false), // false = show cached first
        fetchForecast(latitude, longitude, units, false), // false = show cached first
        // Temporarily disable alerts to prevent infinite loop
        // fetchAlerts(latitude, longitude),
      ]);
      
      // Log any failures but don't throw
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const operation = ['current weather', 'forecast'][index];
          console.warn(`Failed to refresh ${operation}:`, result.reason);
        }
      });
    } catch (err) {
      console.error('Error loading weather:', err);
      throw err;
    }
  }, [loadCachedWeather, loadCachedForecast, fetchCurrentWeather, fetchForecast]);

  const clearError = useCallback(() => {
    setError(null);
    setNetworkError(null);
  }, []);

  const clearNetworkError = useCallback(() => {
    setNetworkError(null);
  }, []);

  // Fast initialization - load cached data immediately without API calls
  const fastInitialize = useCallback(async (latitude: number, longitude: number) => {
    try {
      const currentUserId = await ensureUserInitialized();
      const location = createLocationObject(currentUserId, latitude, longitude);

      // Load cached data in parallel
      const [cachedWeather, cachedForecast] = await Promise.allSettled([
        offlineCacheService.getCachedCurrentWeather(location, currentUserId),
        offlineCacheService.getCachedWeatherForecast(location, currentUserId),
      ]);

      // Set cached data immediately if available
      if (cachedWeather.status === 'fulfilled' && cachedWeather.value) {
        setCurrentWeather(cachedWeather.value);
        setLastUpdated(new Date());
      }

      if (cachedForecast.status === 'fulfilled' && cachedForecast.value) {
        setForecast(cachedForecast.value);
        setLastUpdated(new Date());
      }

      // Return whether we have any cached data
      return !!(cachedWeather.status === 'fulfilled' && cachedWeather.value);
    } catch (error) {
      console.warn('Error in fast initialization:', error);
      return false;
    }
  }, [createLocationObject]);

  const clearCache = useCallback(async () => {
    if (!userId) return;

    try {
      await offlineCacheService.clearExpiredCache();
    } catch (err) {
      console.error('Error clearing cache:', err);
    }
  }, [userId]);

  const getCacheInfo = useCallback(async () => {
    if (!userId) return null;

    try {
      return await offlineCacheService.getCacheInfo(userId);
    } catch (err) {
      console.error('Error getting cache info:', err);
      return null;
    }
  }, [userId]);

  // Load cached data on mount
  useEffect(() => {
    if (userId) {
      // Clear expired cache on app start
      clearCache();
    }
  }, [userId]); // clearCache is stable, no need for dependency

  return {
    currentWeather,
    forecast,
    alerts,
    isLoading,
    error,
    setError,
    networkError,
    lastUpdated,
    isOffline,
    isOnline,
    isSlowConnection,
    userId,
    fetchCurrentWeather,
    fetchForecast,
    fetchAlerts,
    searchLocations,
    reverseGeocode,
    refreshWeather,
    fastLoadWeather,
    loadCachedWeather,
    loadCachedForecast,
    fastInitialize,
    clearError,
    clearNetworkError,
    clearCache,
    getCacheInfo,
    refreshNetworkStatus,
  };
};
