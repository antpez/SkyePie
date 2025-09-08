export interface User {
  id: string;
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
  preferences: UserPreferences;
  isActive: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language?: string;
  notifications: NotificationPreferences;
  display: DisplayPreferences;
}

export interface NotificationPreferences {
  enabled: boolean;
  severeWeather: boolean;
  dailyForecast: boolean;
  hourlyUpdates: boolean;
  soundEnabled: boolean;
}

export interface DisplayPreferences {
  showFeelsLike: boolean;
  showHumidity: boolean;
  showWindSpeed: boolean;
  showPressure: boolean;
  showUVIndex: boolean;
  showSunriseSunset: boolean;
}

export interface UserSettings {
  id: string;
  userId: string;
  temperatureUnit: 'celsius' | 'fahrenheit';
  windSpeedUnit: 'kmh' | 'mph' | 'ms';
  pressureUnit: 'hpa' | 'in' | 'mb';
  distanceUnit: 'km' | 'miles';
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  locationAccuracy: 'high' | 'medium' | 'low';
  autoRefreshInterval: number; // minutes
  showFeelsLike: boolean;
  showHumidity: boolean;
  showWindSpeed: boolean;
  showPressure: boolean;
  showUVIndex: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeatherAlert {
  id: string;
  locationId: string;
  alertType: 'severe_weather' | 'temperature' | 'wind' | 'precipitation';
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  createdAt: Date;
}
