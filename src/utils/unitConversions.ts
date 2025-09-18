import { TemperatureUnit, WindSpeedUnit, RainfallUnit, DistanceUnit } from '../types/units';

// Temperature conversions
export const convertTemperature = (value: number, from: TemperatureUnit, to: TemperatureUnit): number => {
  if (from === to) return value;
  
  if (from === 'celsius' && to === 'fahrenheit') {
    return (value * 9/5) + 32;
  }
  
  if (from === 'fahrenheit' && to === 'celsius') {
    return (value - 32) * 5/9;
  }
  
  return value;
};

// Wind speed conversions
export const convertWindSpeed = (value: number, from: WindSpeedUnit, to: WindSpeedUnit): number => {
  if (from === to) return value;
  
  // Convert to m/s first
  let msValue: number;
  switch (from) {
    case 'ms':
      msValue = value;
      break;
    case 'kmh':
      msValue = value / 3.6;
      break;
    case 'mph':
      msValue = value * 0.44704;
      break;
    default:
      msValue = value;
  }
  
  // Convert from m/s to target unit
  switch (to) {
    case 'ms':
      return msValue;
    case 'kmh':
      return msValue * 3.6;
    case 'mph':
      return msValue / 0.44704;
    default:
      return msValue;
  }
};

// Rainfall conversions
export const convertRainfall = (value: number, from: RainfallUnit, to: RainfallUnit): number => {
  if (from === to) return value;
  
  // Convert to mm first
  let mmValue: number;
  switch (from) {
    case 'mm':
      mmValue = value;
      break;
    case 'in':
      mmValue = value * 25.4;
      break;
    default:
      mmValue = value;
  }
  
  // Convert from mm to target unit
  switch (to) {
    case 'mm':
      return mmValue;
    case 'in':
      return mmValue / 25.4;
    default:
      return mmValue;
  }
};

// Distance conversions
export const convertDistance = (value: number, from: DistanceUnit, to: DistanceUnit): number => {
  if (from === to) return value;
  
  if (from === 'km' && to === 'miles') {
    return value * 0.621371;
  }
  
  if (from === 'miles' && to === 'km') {
    return value / 0.621371;
  }
  
  return value;
};

// Format temperature with unit symbol
export const formatTemperature = (value: number, unit: TemperatureUnit): string => {
  const rounded = Math.round(value);
  const symbol = unit === 'fahrenheit' ? '°F' : '°C';
  return `${rounded}${symbol}`;
};

// Format wind speed with unit symbol
export const formatWindSpeed = (value: number, unit: WindSpeedUnit): string => {
  const rounded = Math.round(value);
  const symbol = unit === 'mph' ? 'mph' : unit === 'ms' ? 'm/s' : 'km/h';
  return `${rounded} ${symbol}`;
};

// Format rainfall with unit symbol
export const formatRainfall = (value: number, unit: RainfallUnit): string => {
  const rounded = Math.round(value * 10) / 10; // Round to 1 decimal place
  const symbol = unit === 'in' ? 'in' : 'mm';
  return `${rounded} ${symbol}`;
};

// Format distance with unit symbol
export const formatDistance = (value: number, unit: DistanceUnit): string => {
  const rounded = Math.round(value);
  const symbol = unit === 'miles' ? 'miles' : 'km';
  return `${rounded} ${symbol}`;
};

// Get unit symbol
export const getUnitSymbol = (unit: string): string => {
  switch (unit) {
    case 'celsius':
      return '°C';
    case 'fahrenheit':
      return '°F';
    case 'kmh':
      return 'km/h';
    case 'mph':
      return 'mph';
    case 'ms':
      return 'm/s';
    case 'mm':
      return 'mm';
    case 'in':
      return 'in';
    case 'km':
      return 'km';
    case 'miles':
      return 'miles';
    default:
      return '';
  }
};

// Convert and format temperature
export const convertAndFormatTemperature = (
  value: number, 
  from: TemperatureUnit, 
  to: TemperatureUnit
): string => {
  const converted = convertTemperature(value, from, to);
  return formatTemperature(converted, to);
};

// Convert and format wind speed
export const convertAndFormatWindSpeed = (
  value: number, 
  from: WindSpeedUnit, 
  to: WindSpeedUnit
): string => {
  const converted = convertWindSpeed(value, from, to);
  return formatWindSpeed(converted, to);
};

// Convert and format rainfall
export const convertAndFormatRainfall = (
  value: number, 
  from: RainfallUnit, 
  to: RainfallUnit
): string => {
  const converted = convertRainfall(value, from, to);
  return formatRainfall(converted, to);
};

// Convert and format distance
export const convertAndFormatDistance = (
  value: number, 
  from: DistanceUnit, 
  to: DistanceUnit
): string => {
  const converted = convertDistance(value, from, to);
  return formatDistance(converted, to);
};
