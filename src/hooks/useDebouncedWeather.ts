import { useState, useEffect, useCallback, useRef } from 'react';
import { LocationCoordinates } from '../types';
import { weatherService } from '../services';

interface WeatherData {
  current?: any;
  forecast?: any;
  loading: boolean;
  error: string | null;
}

export const useDebouncedWeather = (location: LocationCoordinates | null, debounceMs: number = 500) => {
  const [weatherData, setWeatherData] = useState<WeatherData>({
    loading: false,
    error: null,
  });
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocationRef = useRef<LocationCoordinates | null>(null);

  const loadWeather = useCallback(async (coords: LocationCoordinates) => {
    try {
      setWeatherData(prev => ({ ...prev, loading: true, error: null }));
      
      // Load current weather and forecast in parallel
      const [current, forecast] = await Promise.all([
        weatherService.getCurrentWeather(coords.latitude, coords.longitude),
        weatherService.getWeatherForecast(coords.latitude, coords.longitude)
      ]);
      
      setWeatherData({
        current,
        forecast,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading weather data:', error);
      setWeatherData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load weather data',
      }));
    }
  }, []);

  useEffect(() => {
    if (!location) return;

    // Check if location has actually changed significantly
    const hasLocationChanged = !lastLocationRef.current || 
      Math.abs(location.latitude - lastLocationRef.current.latitude) > 0.001 ||
      Math.abs(location.longitude - lastLocationRef.current.longitude) > 0.001;

    if (!hasLocationChanged) return;

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      lastLocationRef.current = location;
      loadWeather(location);
    }, debounceMs);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [location, debounceMs, loadWeather]);

  const refreshWeather = useCallback(() => {
    if (location) {
      loadWeather(location);
    }
  }, [location, loadWeather]);

  return {
    ...weatherData,
    refreshWeather,
  };
};
