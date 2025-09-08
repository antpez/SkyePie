export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WeatherApiConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
}

export interface LocationApiConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
}

export interface CacheConfig {
  currentWeatherTTL: number; // seconds
  forecastTTL: number; // seconds
  hourlyForecastTTL: number; // seconds
  locationSearchTTL: number; // seconds
}

export interface ApiEndpoints {
  currentWeather: string;
  forecast: string;
  hourlyForecast: string;
  locationSearch: string;
  reverseGeocoding: string;
  weatherAlerts: string;
}
