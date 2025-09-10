import { TemperatureUnit, WindSpeedUnit, PressureUnit, DistanceUnit } from '../types/units';

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

// Pressure conversions
export const convertPressure = (value: number, from: PressureUnit, to: PressureUnit): number => {
  if (from === to) return value;
  
  // Convert to hPa first
  let hpaValue: number;
  switch (from) {
    case 'hpa':
    case 'mb':
      hpaValue = value;
      break;
    case 'in':
      hpaValue = value * 33.8638866667;
      break;
    default:
      hpaValue = value;
  }
  
  // Convert from hPa to target unit
  switch (to) {
    case 'hpa':
    case 'mb':
      return hpaValue;
    case 'in':
      return hpaValue / 33.8638866667;
    default:
      return hpaValue;
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

// Format pressure with unit symbol
export const formatPressure = (value: number, unit: PressureUnit): string => {
  const rounded = Math.round(value);
  const symbol = unit === 'in' ? 'inHg' : unit === 'mb' ? 'mb' : 'hPa';
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
    case 'hpa':
      return 'hPa';
    case 'mb':
      return 'mb';
    case 'in':
      return 'inHg';
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

// Convert and format pressure
export const convertAndFormatPressure = (
  value: number, 
  from: PressureUnit, 
  to: PressureUnit
): string => {
  const converted = convertPressure(value, from, to);
  return formatPressure(converted, to);
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
