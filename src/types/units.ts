export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph' | 'ms';
export type RainfallUnit = 'mm' | 'in';
export type DistanceUnit = 'km' | 'miles';

export interface WeatherUnits {
  temperature: TemperatureUnit;
  windSpeed: WindSpeedUnit;
  rainfall: RainfallUnit;
  distance: DistanceUnit;
}

export interface UnitOption {
  value: string;
  label: string;
  symbol: string;
  description: string;
}

export const TEMPERATURE_UNITS: UnitOption[] = [
  {
    value: 'celsius',
    label: 'Celsius',
    symbol: '°C',
    description: 'Metric temperature unit',
  },
  {
    value: 'fahrenheit',
    label: 'Fahrenheit',
    symbol: '°F',
    description: 'Imperial temperature unit',
  },
];

export const WIND_SPEED_UNITS: UnitOption[] = [
  {
    value: 'kmh',
    label: 'km/h',
    symbol: 'km/h',
    description: 'Kilometers per hour',
  },
  {
    value: 'mph',
    label: 'mph',
    symbol: 'mph',
    description: 'Miles per hour',
  },
  {
    value: 'ms',
    label: 'm/s',
    symbol: 'm/s',
    description: 'Meters per second',
  },
];

export const RAINFALL_UNITS: UnitOption[] = [
  {
    value: 'mm',
    label: 'mm',
    symbol: 'mm',
    description: 'Millimeters',
  },
  {
    value: 'in',
    label: 'in',
    symbol: 'in',
    description: 'Inches',
  },
];

export const DISTANCE_UNITS: UnitOption[] = [
  {
    value: 'km',
    label: 'km',
    symbol: 'km',
    description: 'Kilometers',
  },
  {
    value: 'miles',
    label: 'miles',
    symbol: 'miles',
    description: 'Miles',
  },
];

export const DEFAULT_UNITS: WeatherUnits = {
  temperature: 'celsius',
  windSpeed: 'kmh',
  rainfall: 'mm',
  distance: 'km',
};
