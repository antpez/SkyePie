import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CurrentWeather, WeatherForecast, LocationSearchResult, TemperatureUnit } from '../types';
import { createWeatherService } from '../services';
import { storageService } from '../services';

export const useWeather = (apiKey?: string) => {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Use ref to store weather service to prevent recreation
  const weatherServiceRef = useRef<ReturnType<typeof createWeatherService> | null>(null);
  
  // Memoize weather service creation
  const weatherService = useMemo(() => {
    if (apiKey && apiKey !== 'your_api_key_here' && apiKey !== '') {
      if (!weatherServiceRef.current) {
        weatherServiceRef.current = createWeatherService(apiKey);
      }
      return weatherServiceRef.current;
    }
    return null;
  }, [apiKey]);

  // Cache for preventing duplicate requests
  const requestCache = useRef<Map<string, Promise<any>>>(new Map());

  const fetchCurrentWeather = useCallback(async (
    latitude: number, 
    longitude: number,
    units: TemperatureUnit = 'celsius'
  ) => {
    if (!weatherService) {
      throw new Error('Weather service not initialized. Please provide an API key.');
    }

    // Create cache key for this request
    const cacheKey = `weather_${latitude}_${longitude}_${units}`;
    
    // Check if request is already in progress
    if (requestCache.current.has(cacheKey)) {
      return requestCache.current.get(cacheKey);
    }

    const requestPromise = (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const weather = await weatherService.getCurrentWeather(
          latitude, 
          longitude, 
          units === 'fahrenheit' ? 'imperial' : 'metric'
        );

        setCurrentWeather(weather);
        setLastUpdated(new Date());

        // Cache the weather data
        await storageService.setItem('cached_weather', {
          data: weather,
          timestamp: Date.now(),
          location: { latitude, longitude },
        });

        return weather;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
        // Remove from cache when done
        requestCache.current.delete(cacheKey);
      }
    })();

    // Store the promise in cache
    requestCache.current.set(cacheKey, requestPromise);
    return requestPromise;
  }, [weatherService]);

  const fetchForecast = useCallback(async (
    latitude: number, 
    longitude: number,
    units: TemperatureUnit = 'celsius'
  ) => {
    if (!weatherService) {
      throw new Error('Weather service not initialized. Please provide an API key.');
    }

    // Create cache key for this request
    const cacheKey = `forecast_${latitude}_${longitude}_${units}`;
    
    // Check if request is already in progress
    if (requestCache.current.has(cacheKey)) {
      return requestCache.current.get(cacheKey);
    }

    const requestPromise = (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const forecastData = await weatherService.getWeatherForecast(
          latitude, 
          longitude, 
          units === 'fahrenheit' ? 'imperial' : 'metric'
        );

        setForecast(forecastData);
        setLastUpdated(new Date());

        // Cache the forecast data
        await storageService.setItem('cached_forecast', {
          data: forecastData,
          timestamp: Date.now(),
          location: { latitude, longitude },
        });

        return forecastData;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch forecast data';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
        // Remove from cache when done
        requestCache.current.delete(cacheKey);
      }
    })();

    // Store the promise in cache
    requestCache.current.set(cacheKey, requestPromise);
    return requestPromise;
  }, [weatherService]);

  const searchLocations = useCallback(async (query: string) => {
    if (!weatherService) {
      throw new Error('Weather service not initialized. Please provide an API key.');
    }

    try {
      setError(null);
      return await weatherService.searchLocations(query);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search locations';
      setError(errorMessage);
      throw err;
    }
  }, [weatherService]);

  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    if (!weatherService) {
      throw new Error('Weather service not initialized. Please provide an API key.');
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

  const loadCachedWeather = useCallback(async () => {
    try {
      const cached = await storageService.getItem<{
        data: CurrentWeather;
        timestamp: number;
        location: { latitude: number; longitude: number };
      }>('cached_weather');

      if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) { // 10 minutes
        setCurrentWeather(cached.data);
        setLastUpdated(new Date(cached.timestamp));
        return cached.data;
      }
    } catch (err) {
      console.error('Error loading cached weather:', err);
    }
    return null;
  }, []);

  const loadCachedForecast = useCallback(async () => {
    try {
      const cached = await storageService.getItem<{
        data: WeatherForecast;
        timestamp: number;
        location: { latitude: number; longitude: number };
      }>('cached_forecast');

      if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) { // 10 minutes
        setForecast(cached.data);
        setLastUpdated(new Date(cached.timestamp));
        return cached.data;
      }
    } catch (err) {
      console.error('Error loading cached forecast:', err);
    }
    return null;
  }, []);

  const refreshWeather = useCallback(async (
    latitude: number, 
    longitude: number,
    units: TemperatureUnit = 'celsius'
  ) => {
    try {
      // Use Promise.allSettled to prevent one failure from stopping the other
      const results = await Promise.allSettled([
        fetchCurrentWeather(latitude, longitude, units),
        fetchForecast(latitude, longitude, units),
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
  }, [fetchCurrentWeather, fetchForecast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load cached data on mount
  useEffect(() => {
    loadCachedWeather();
    loadCachedForecast();
  }, [loadCachedWeather, loadCachedForecast]);

  return {
    currentWeather,
    forecast,
    isLoading,
    error,
    lastUpdated,
    fetchCurrentWeather,
    fetchForecast,
    searchLocations,
    reverseGeocode,
    refreshWeather,
    loadCachedWeather,
    loadCachedForecast,
    clearError,
  };
};
