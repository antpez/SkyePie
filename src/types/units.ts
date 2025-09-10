export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph' | 'ms';
export type PressureUnit = 'hpa' | 'in' | 'mb';
export type DistanceUnit = 'km' | 'miles';

export interface WeatherUnits {
  temperature: TemperatureUnit;
  windSpeed: WindSpeedUnit;
  pressure: PressureUnit;
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

export const PRESSURE_UNITS: UnitOption[] = [
  {
    value: 'hpa',
    label: 'hPa',
    symbol: 'hPa',
    description: 'Hectopascals',
  },
  {
    value: 'mb',
    label: 'mb',
    symbol: 'mb',
    description: 'Millibars',
  },
  {
    value: 'in',
    label: 'inHg',
    symbol: 'inHg',
    description: 'Inches of mercury',
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
  pressure: 'hpa',
  distance: 'km',
};
