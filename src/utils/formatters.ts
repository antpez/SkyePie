import { TemperatureUnit, WindSpeedUnit, PressureUnit, DistanceUnit } from '../types/units';
import { 
  convertAndFormatTemperature, 
  convertAndFormatWindSpeed, 
  convertAndFormatPressure,
  convertAndFormatDistance 
} from './unitConversions';

export const formatTemperature = (temp: number, unit: TemperatureUnit = 'celsius'): string => {
  return convertAndFormatTemperature(temp, 'celsius', unit);
};

export const formatWindSpeed = (speed: number, unit: WindSpeedUnit = 'kmh'): string => {
  return convertAndFormatWindSpeed(speed, 'ms', unit);
};

export const formatPressure = (pressure: number, unit: PressureUnit = 'hpa'): string => {
  return convertAndFormatPressure(pressure, 'hpa', unit);
};

export const formatHumidity = (humidity: number): string => {
  return `${humidity}%`;
};

export const formatDistance = (distance: number, unit: DistanceUnit = 'km'): string => {
  return convertAndFormatDistance(distance, 'km', unit);
};

export const formatVisibility = (visibility: number, unit: DistanceUnit = 'km'): string => {
  const km = visibility / 1000;
  return convertAndFormatDistance(km, 'km', unit);
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
  const date = new Date(timestamp * 1000);
  if (timezone) {
    // timezone is in seconds offset from UTC
    // Create a new date with the timezone offset applied
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
    const localTime = new Date(utcTime + (timezone * 1000));
    return localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (timestamp: number, timezone?: number): string => {
  const date = new Date(timestamp * 1000);
  if (timezone) {
    // timezone is in seconds offset from UTC
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
    const localTime = new Date(utcTime + (timezone * 1000));
    return localTime.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  return date.toLocaleDateString([], { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const formatDayOfWeek = (timestamp: number, timezone?: number): string => {
  const date = new Date(timestamp * 1000);
  if (timezone) {
    // timezone is in seconds offset from UTC
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
    const localTime = new Date(utcTime + (timezone * 1000));
    return localTime.toLocaleDateString([], { weekday: 'short' });
  }
  return date.toLocaleDateString([], { weekday: 'short' });
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
