export const APP_CONFIG = {
  name: 'SkyePie',
  version: '1.0.0',
  description: 'Clean, minimal weather app',
  
  // API Configuration
  api: {
    openWeatherMap: {
      baseUrl: 'https://api.openweathermap.org/data/2.5',
      geocodingUrl: 'https://api.openweathermap.org/geo/1.0',
      apiKey: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '',
    },
    groq: {
      baseUrl: 'https://api.groq.com/openai/v1',
      apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY || '',
      model: 'llama-3.1-8b-instant',
      maxTokens: 1000,
      temperature: 0.7,
    },
    huggingface: {
      baseUrl: 'https://api-inference.huggingface.co/models',
      apiKey: process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY || '',
      model: 'microsoft/DialoGPT-medium',
      maxTokens: 500,
      temperature: 0.7,
    },
  },
  
  // Cache Configuration
  cache: {
    weatherTTL: 10 * 60 * 1000, // 10 minutes
    forecastTTL: 30 * 60 * 1000, // 30 minutes
    locationTTL: 60 * 60 * 1000, // 1 hour
  },
  
  // Default Location (London)
  defaultLocation: {
    name: 'London',
    country: 'GB',
    latitude: 51.5074,
    longitude: -0.1278,
  },
  
  // App Settings
  settings: {
    maxSearchHistory: 10,
    maxFavoriteLocations: 5,
    refreshInterval: 15 * 60 * 1000, // 15 minutes
  },
} as const;
