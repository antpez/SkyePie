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

export class WeatherService {
  private static instance: WeatherService;
  private api: AxiosInstance;
  private config: WeatherApiConfig;

  constructor(apiKey: string) {
    this.config = {
      baseUrl: APP_CONFIG.api.openWeatherMap.baseUrl,
      apiKey,
      timeout: 10000,
      retryAttempts: 3,
    };

    this.api = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      params: {
        appid: this.config.apiKey,
        units: 'metric', // Use metric units by default
      },
    });

    this.setupInterceptors();
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
        // Use the new network error handler
        const networkError = networkErrorHandler.createNetworkError(error);
        networkErrorHandler.logError(networkError, 'WeatherService');
        throw networkError;
      }
    );
  }

  async getCurrentWeather(
    latitude: number, 
    longitude: number,
    units: 'metric' | 'imperial' = 'metric'
  ): Promise<CurrentWeather> {
    return retryHandler.executeWithRetry(
      async () => {
        const response: AxiosResponse<CurrentWeather> = await this.api.get('/weather', {
          params: {
            lat: latitude,
            lon: longitude,
            units,
          },
        });

        return response.data;
      },
      {
        context: 'WeatherService.getCurrentWeather',
        onRetry: (attempt, error) => {
          console.warn(`Retrying getCurrentWeather (attempt ${attempt}):`, error.message);
        },
      }
    );
  }

  async getWeatherForecast(
    latitude: number, 
    longitude: number,
    units: 'metric' | 'imperial' = 'metric'
  ): Promise<WeatherForecast> {
    try {
      const response: AxiosResponse<WeatherForecast> = await this.api.get('/forecast', {
        params: {
          lat: latitude,
          lon: longitude,
          units,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      throw error;
    }
  }

  async searchLocations(query: string, limit: number = 5): Promise<LocationSearchResult[]> {
    try {
      const response = await axios.get(`${APP_CONFIG.api.openWeatherMap.geocodingUrl}/direct`, {
        params: {
          q: query,
          limit,
          appid: this.config.apiKey,
        },
        timeout: this.config.timeout,
      });

      return response.data.map((item: any) => ({
        name: item.name,
        country: item.country,
        state: item.state,
        latitude: item.lat,
        longitude: item.lon,
        displayName: `${item.name}${item.state ? `, ${item.state}` : ''}, ${item.country}`,
      }));
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

      return response.data.map((item: any) => ({
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
