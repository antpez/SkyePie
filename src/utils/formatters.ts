import { TemperatureUnit, WindSpeedUnit, PressureUnit, DistanceUnit } from '../types/units';
import { 
  convertAndFormatTemperature, 
  convertAndFormatWindSpeed, 
  convertAndFormatPressure,
  convertAndFormatDistance 
} from './unitConversions';

// Cache for expensive computations
const formatCache = new Map<string, string>();
const CACHE_SIZE_LIMIT = 1000;

// Helper function to create cache keys
const createCacheKey = (prefix: string, value: number, unit: string): string => 
  `${prefix}:${value}:${unit}`;

// Helper function to manage cache size
const manageCacheSize = () => {
  if (formatCache.size > CACHE_SIZE_LIMIT) {
    const entries = Array.from(formatCache.entries());
    // Remove oldest 25% of entries
    const toRemove = entries.slice(0, Math.floor(entries.length * 0.25));
    toRemove.forEach(([key]) => formatCache.delete(key));
  }
};

export const formatTemperature = (temp: number, unit: TemperatureUnit = 'celsius'): string => {
  const cacheKey = createCacheKey('temp', temp, unit);
  if (formatCache.has(cacheKey)) {
    return formatCache.get(cacheKey)!;
  }
  
  const result = convertAndFormatTemperature(temp, 'celsius', unit);
  formatCache.set(cacheKey, result);
  manageCacheSize();
  return result;
};

export const formatWindSpeed = (speed: number, unit: WindSpeedUnit = 'kmh'): string => {
  const cacheKey = createCacheKey('wind', speed, unit);
  if (formatCache.has(cacheKey)) {
    return formatCache.get(cacheKey)!;
  }
  
  const result = convertAndFormatWindSpeed(speed, 'ms', unit);
  formatCache.set(cacheKey, result);
  manageCacheSize();
  return result;
};

export const formatPressure = (pressure: number, unit: PressureUnit = 'hpa'): string => {
  const cacheKey = createCacheKey('pressure', pressure, unit);
  if (formatCache.has(cacheKey)) {
    return formatCache.get(cacheKey)!;
  }
  
  const result = convertAndFormatPressure(pressure, 'hpa', unit);
  formatCache.set(cacheKey, result);
  manageCacheSize();
  return result;
};

export const formatHumidity = (humidity: number): string => {
  // Simple string concatenation, no need to cache
  return `${humidity}%`;
};

export const formatDistance = (distance: number, unit: DistanceUnit = 'km'): string => {
  const cacheKey = createCacheKey('distance', distance, unit);
  if (formatCache.has(cacheKey)) {
    return formatCache.get(cacheKey)!;
  }
  
  const result = convertAndFormatDistance(distance, 'km', unit);
  formatCache.set(cacheKey, result);
  manageCacheSize();
  return result;
};

export const formatVisibility = (visibility: number, unit: DistanceUnit = 'km'): string => {
  const km = visibility / 1000;
  const cacheKey = createCacheKey('visibility', km, unit);
  if (formatCache.has(cacheKey)) {
    return formatCache.get(cacheKey)!;
  }
  
  const result = convertAndFormatDistance(km, 'km', unit);
  formatCache.set(cacheKey, result);
  manageCacheSize();
  return result;
};

export const formatUVIndex = (uvIndex: number): string => {
  return `UV ${uvIndex}`;
};

export const formatWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

export const formatTime = (timestamp: number, timezone?: number): string => {
  const cacheKey = createCacheKey('time', timestamp, timezone?.toString() || 'local');
  if (formatCache.has(cacheKey)) {
    return formatCache.get(cacheKey)!;
  }

  const date = new Date(timestamp * 1000);
  let result: string;
  
  if (timezone) {
    // timezone is in seconds offset from UTC
    // Create a new date with the timezone offset applied
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
    const localTime = new Date(utcTime + (timezone * 1000));
    result = localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    result = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  formatCache.set(cacheKey, result);
  manageCacheSize();
  return result;
};

export const formatDate = (timestamp: number, timezone?: number): string => {
  const cacheKey = createCacheKey('date', timestamp, timezone?.toString() || 'local');
  if (formatCache.has(cacheKey)) {
    return formatCache.get(cacheKey)!;
  }

  const date = new Date(timestamp * 1000);
  let result: string;
  
  if (timezone) {
    // timezone is in seconds offset from UTC
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
    const localTime = new Date(utcTime + (timezone * 1000));
    result = localTime.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  } else {
    result = date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  formatCache.set(cacheKey, result);
  manageCacheSize();
  return result;
};

export const formatDayOfWeek = (timestamp: number, timezone?: number): string => {
  const cacheKey = createCacheKey('day', timestamp, timezone?.toString() || 'local');
  if (formatCache.has(cacheKey)) {
    return formatCache.get(cacheKey)!;
  }

  const date = new Date(timestamp * 1000);
  let result: string;
  
  if (timezone) {
    // timezone is in seconds offset from UTC
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
    const localTime = new Date(utcTime + (timezone * 1000));
    result = localTime.toLocaleDateString([], { weekday: 'short' });
  } else {
    result = date.toLocaleDateString([], { weekday: 'short' });
  }
  
  formatCache.set(cacheKey, result);
  manageCacheSize();
  return result;
};


// Theme-aware temperature color function
export const getThemeAwareTemperatureColor = (
  temp: number, 
  unit: TemperatureUnit = 'celsius',
  isDark: boolean = false
): string => {
  const celsius = unit === 'fahrenheit' ? (temp - 32) * 5/9 : temp;
  
  // Use theme-appropriate colors
  if (isDark) {
    if (celsius >= 30) return '#FF6B6B'; // hot - light red
    if (celsius >= 20) return '#FFB74D'; // warm - light orange
    if (celsius >= 10) return '#81C784'; // mild - light green
    if (celsius >= 0) return '#64B5F6';  // cool - light blue
    return '#BA68C8'; // cold - light purple
  } else {
    if (celsius >= 30) return '#D32F2F'; // hot - dark red
    if (celsius >= 20) return '#F57C00'; // warm - dark orange
    if (celsius >= 10) return '#388E3C'; // mild - dark green
    if (celsius >= 0) return '#1976D2';  // cool - dark blue
    return '#7B1FA2'; // cold - dark purple
  }
};
