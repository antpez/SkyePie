import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  CurrentWeather, 
  WeatherForecast, 
  LocationSearchResult,
  WeatherApiConfig,
  ApiError,
  WeatherAlert
} from '../types';
import { APP_CONFIG } from '../config/app';
import { networkErrorHandler } from '../utils/networkErrorHandler';
import { retryHandler } from '../utils/retryHandler';
import { performanceMonitor } from '../utils/performanceMonitor';
import { networkAwareConfig } from '../utils/networkAwareConfig';
import { networkStatusMonitor } from '../utils/networkStatus';
import { weatherSmartCache, WEATHER_CACHE_CONFIG } from '../utils/smartCache';
import { LocationCoordinates } from '../types';

/**
 * WeatherService - Handles all weather-related API calls to OpenWeatherMap
 * Provides caching, error handling, and retry logic for weather data
 */
export class WeatherService {
  private static instance: WeatherService;
  private api: AxiosInstance;
  private config: WeatherApiConfig;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes for faster updates

  constructor(apiKey: string) {
    // Validate API key
    if (!apiKey || apiKey === 'your_api_key_here' || apiKey === '') {
      console.error('❌ OpenWeatherMap API key is not configured!');
      console.error('Please set EXPO_PUBLIC_OPENWEATHER_API_KEY in your .env file');
      throw new Error('OpenWeatherMap API key is required. Please configure EXPO_PUBLIC_OPENWEATHER_API_KEY in your .env file');
    }

    // Get network-aware configuration
    const networkStatus = networkStatusMonitor.getCurrentStatus();
    const weatherConfig = networkAwareConfig.getWeatherConfigForNetwork(networkStatus);
    
    this.config = {
      baseUrl: APP_CONFIG.api.openWeatherMap.baseUrl,
      apiKey,
      timeout: weatherConfig.timeout,
      retryAttempts: weatherConfig.retryAttempts,
    };

    this.api = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      params: {
        appid: this.config.apiKey,
        units: 'metric', // Use metric units by default
      },
      // Optimize for faster requests
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive', // Enable keep-alive
        'Cache-Control': 'no-cache', // Disable caching at HTTP level
      },
      // Enable keep-alive for faster subsequent requests
      maxRedirects: 2, // Reduced from 3 to 2
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      // React Native handles connection pooling automatically
    });

    this.setupInterceptors();
    this.setupCacheCleanup();
  }

  static getInstance(apiKey?: string): WeatherService {
    if (!WeatherService.instance) {
      if (!apiKey) {
        throw new Error('API key is required for WeatherService');
      }
      WeatherService.instance = new WeatherService(apiKey);
    }
    return WeatherService.instance;
  }

  /**
   * Update configuration based on current network conditions
   */
  updateNetworkAwareConfig(): void {
    const networkStatus = networkStatusMonitor.getCurrentStatus();
    const weatherConfig = networkAwareConfig.getWeatherConfigForNetwork(networkStatus);
    
    this.config.timeout = weatherConfig.timeout;
    this.config.retryAttempts = weatherConfig.retryAttempts;
    
    // Update axios instance timeout
    this.api.defaults.timeout = weatherConfig.timeout;
    
    console.log('🌐 Updated weather service config for network:', weatherConfig);
  }

  private setupCacheCleanup() {
    // Clean up expired cache entries every 2 minutes for better memory management
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > value.ttl) {
          this.cache.delete(key);
        }
      }
      
      // Also clean up smart cache
      weatherSmartCache.cleanup();
    }, 2 * 60 * 1000);
  }

  private getCacheKey(endpoint: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${endpoint}?${sortedParams}`;
  }

  private getCachedData<T>(cacheKey: string): T | null {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(cacheKey);
    }
    return null;
  }

  private setCachedData<T>(cacheKey: string, data: T, ttl: number = this.CACHE_TTL): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        // Enhanced error handling for network issues
        let networkError;
        
        if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
          networkError = {
            code: 'ERR_NETWORK',
            message: 'Unable to connect to the weather service. Please check your internet connection.',
            type: 'CONNECTION_ERROR',
            details: error,
            timestamp: Date.now(),
            retryable: true,
          };
        } else {
          networkError = networkErrorHandler.createNetworkError(error);
        }
        
        networkErrorHandler.logError(networkError, 'WeatherService');
        throw networkError;
      }
    );
  }

  async getCurrentWeather(
    latitude: number, 
    longitude: number,
    units: 'metric' | 'imperial' = 'metric',
    accuracy?: number
  ): Promise<CurrentWeather> {
    return performanceMonitor.measureAsync('WeatherService.getCurrentWeather', async () => {
      const location: LocationCoordinates = {
        latitude,
        longitude,
        accuracy,
      };
      
      const additionalParams = { units };
      
          // Check smart cache first
          const cachedData = weatherSmartCache.get(location, additionalParams);
          if (cachedData) {
            // Only log cache usage occasionally
            if (__DEV__ && Math.random() < 0.1) {
              console.log('🌤️ Using smart cached weather data');
            }
            // Validate cached data structure
            if (cachedData && typeof cachedData === 'object' && cachedData.main && cachedData.weather) {
              return cachedData;
            } else {
              console.warn('🌤️ Cached data is corrupted, fetching fresh data');
            }
          }

      const result = await retryHandler.executeWithRetry(
        async () => {
          const response: AxiosResponse<CurrentWeather> = await this.api.get('/weather', {
            params: { lat: latitude, lon: longitude, units },
          });

          // Store in smart cache with location accuracy
          weatherSmartCache.set(location, response.data, additionalParams);
          
          // Also store in legacy cache for backward compatibility
          const legacyCacheKey = this.getCacheKey('/weather', { lat: latitude, lon: longitude, units });
          this.setCachedData(legacyCacheKey, response.data);
          
          return response.data;
        },
        {
          context: 'WeatherService.getCurrentWeather',
          onRetry: (attempt, error) => {
            console.warn(`Retrying getCurrentWeather (attempt ${attempt}):`, error.message);
          },
        }
      );
      
      return result;
    });
  }

  async getWeatherForecast(
    latitude: number, 
    longitude: number,
    units: 'metric' | 'imperial' = 'metric',
    accuracy?: number
  ): Promise<WeatherForecast> {
    return performanceMonitor.measureAsync('WeatherService.getWeatherForecast', async () => {
      const location: LocationCoordinates = {
        latitude,
        longitude,
        accuracy,
      };
      
      const additionalParams = { units };
      
        // Check smart cache first
        const cachedData = weatherSmartCache.get(location, additionalParams);
        if (cachedData) {
          // Only log cache usage occasionally
          if (__DEV__ && Math.random() < 0.1) {
            console.log('🌤️ Using smart cached forecast data');
          }
          // Validate cached data structure
          if (cachedData && typeof cachedData === 'object' && cachedData.list && Array.isArray(cachedData.list)) {
            return cachedData;
          } else {
            console.warn('🌤️ Cached forecast data is corrupted, fetching fresh data');
          }
        }

      const result = await retryHandler.executeWithRetry(
        async () => {
          const response: AxiosResponse<WeatherForecast> = await this.api.get('/forecast', {
            params: { lat: latitude, lon: longitude, units },
          });

          // Store in smart cache with location accuracy
          weatherSmartCache.set(location, response.data, additionalParams);
          
          // Also store in legacy cache for backward compatibility
          const legacyCacheKey = this.getCacheKey('/forecast', { lat: latitude, lon: longitude, units });
          this.setCachedData(legacyCacheKey, response.data);
          
          return response.data;
        },
        {
          context: 'WeatherService.getWeatherForecast',
          onRetry: (attempt, error) => {
            console.warn(`Retrying getWeatherForecast (attempt ${attempt}):`, error.message);
          },
        }
      );
      
      return result;
    }, { latitude, longitude, units });
  }

  async searchLocations(query: string, limit: number = 8): Promise<LocationSearchResult[]> {
    try {
      const response = await axios.get(`${APP_CONFIG.api.openWeatherMap.geocodingUrl}/direct`, {
        params: {
          q: query,
          limit: Math.min(limit, 20), // Cap at 20 for API efficiency
          appid: this.config.apiKey,
        },
        timeout: this.config.timeout,
      });

      const results = (response.data || []).map((item: any) => ({
        name: item.name,
        country: item.country,
        state: item.state,
        latitude: item.lat,
        longitude: item.lon,
        displayName: `${item.name}${item.state ? `, ${item.state}` : ''}, ${item.country}`,
      }));

      // Sort results by relevance (exact matches first, then by name length)
      return (results || []).sort((a: LocationSearchResult, b: LocationSearchResult) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const queryLower = query.toLowerCase();
        
        // Exact match gets highest priority
        if (aName === queryLower && bName !== queryLower) return -1;
        if (bName === queryLower && aName !== queryLower) return 1;
        
        // Starts with query gets second priority
        if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1;
        if (bName.startsWith(queryLower) && !aName.startsWith(queryLower)) return 1;
        
        // Shorter names get priority (more likely to be the main city)
        return aName.length - bName.length;
      }).slice(0, limit);
    } catch (error) {
      console.error('Error searching locations:', error);
      throw this.handleApiError({
        code: 'SEARCH_ERROR',
        message: 'Failed to search locations. Please try again.',
        details: error,
        timestamp: Date.now(),
      });
    }
  }

  async reverseGeocode(
    latitude: number, 
    longitude: number
  ): Promise<LocationSearchResult[]> {
    try {
      const response = await axios.get(`${APP_CONFIG.api.openWeatherMap.geocodingUrl}/reverse`, {
        params: {
          lat: latitude,
          lon: longitude,
          limit: 1,
          appid: this.config.apiKey,
        },
        timeout: this.config.timeout,
      });

      return (response.data || []).map((item: any) => ({
        name: item.name,
        country: item.country,
        state: item.state,
        latitude: item.lat,
        longitude: item.lon,
        displayName: `${item.name}${item.state ? `, ${item.state}` : ''}, ${item.country}`,
      }));
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw this.handleApiError({
        code: 'REVERSE_GEOCODE_ERROR',
        message: 'Failed to get location name. Please try again.',
        details: error,
        timestamp: Date.now(),
      });
    }
  }

  async getWeatherAlerts(
    latitude: number, 
    longitude: number
  ): Promise<WeatherAlert[]> {
    // Weather alerts require One Call API which is not available with free tier
    // Return empty array for now - this feature requires a paid OpenWeatherMap subscription
    return [];
  }

  private handleApiError(error: ApiError): Error {
    const apiError = new Error(error.message);
    (apiError as any).code = error.code;
    (apiError as any).details = error.details;
    return apiError;
  }

  updateApiKey(apiKey: string) {
    this.config.apiKey = apiKey;
    this.api.defaults.params = {
      ...this.api.defaults.params,
      appid: apiKey,
    };
  }
}

export const createWeatherService = (apiKey: string): WeatherService => {
  return new WeatherService(apiKey);
};
