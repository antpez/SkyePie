export const APP_CONFIG = {
  name: 'SkyePie',
  version: '1.0.0',
  description: 'Clean, minimal weather app',
} as const;

export const WEATHER_CONFIG = {
  defaultLocation: {
    name: 'London',
    country: 'GB',
    latitude: 51.5074,
    longitude: -0.1278,
  },
  refreshInterval: 15 * 60 * 1000, // 15 minutes in milliseconds
  cacheTimeout: 10 * 60 * 1000, // 10 minutes in milliseconds
  maxSearchHistory: 10,
  maxFavoriteLocations: 5,
} as const;

// API configuration is now centralized in src/config/app.ts

export const STORAGE_KEYS = {
  userSettings: 'user_settings',
  favoriteLocations: 'favorite_locations',
  searchHistory: 'search_history',
  lastKnownLocation: 'last_known_location',
  theme: 'theme',
  permissions: 'permissions',
  displayPreferences: 'display_preferences',
} as const;

export const PERMISSIONS = {
  location: 'location',
  notifications: 'notifications',
} as const;

export const WEATHER_CONDITIONS = {
  clear: ['clear sky'],
  clouds: ['few clouds', 'scattered clouds', 'broken clouds', 'overcast clouds'],
  rain: ['light rain', 'moderate rain', 'heavy rain', 'very heavy rain', 'extreme rain'],
  snow: ['light snow', 'moderate snow', 'heavy snow', 'sleet', 'light sleet', 'shower sleet'],
  thunderstorm: ['thunderstorm', 'thunderstorm with light rain', 'thunderstorm with rain', 'thunderstorm with heavy rain'],
  mist: ['mist', 'fog', 'haze', 'smoke', 'dust', 'sand', 'ash'],
} as const;

// Weather icons are now handled by emojis in the WeatherIcon component
