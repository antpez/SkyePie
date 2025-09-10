export type WeatherMapType = 'precipitation' | 'temperature' | 'wind' | 'clouds' | 'pressure' | 'visibility';

export interface WeatherMapLayer {
  id: string;
  name: string;
  description: string;
  type: WeatherMapType;
  opacity: number;
  visible: boolean;
  zIndex: number;
}

export interface WeatherMapConfig {
  center: {
    lat: number;
    lon: number;
  };
  zoom: number;
  layers: WeatherMapLayer[];
  showControls: boolean;
  showLegend: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in minutes
}

export interface MapTileLayer {
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
}

export interface WeatherMapData {
  type: WeatherMapType;
  timestamp: number;
  data: {
    lat: number;
    lon: number;
    value: number;
    unit: string;
  }[];
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export const DEFAULT_WEATHER_MAP_LAYERS: WeatherMapLayer[] = [
  {
    id: 'precipitation',
    name: 'Precipitation',
    description: 'Rain, snow, and other precipitation',
    type: 'precipitation',
    opacity: 0.7,
    visible: true,
    zIndex: 1,
  },
  {
    id: 'temperature',
    name: 'Temperature',
    description: 'Surface temperature',
    type: 'temperature',
    opacity: 0.6,
    visible: false,
    zIndex: 2,
  },
  {
    id: 'wind',
    name: 'Wind',
    description: 'Wind speed and direction',
    type: 'wind',
    opacity: 0.8,
    visible: false,
    zIndex: 3,
  },
  {
    id: 'clouds',
    name: 'Clouds',
    description: 'Cloud coverage',
    type: 'clouds',
    opacity: 0.5,
    visible: false,
    zIndex: 4,
  },
  {
    id: 'pressure',
    name: 'Pressure',
    description: 'Atmospheric pressure',
    type: 'pressure',
    opacity: 0.6,
    visible: false,
    zIndex: 5,
  },
  {
    id: 'visibility',
    name: 'Visibility',
    description: 'Visibility range',
    type: 'visibility',
    opacity: 0.7,
    visible: false,
    zIndex: 6,
  },
];

export const WEATHER_MAP_TILE_LAYERS: { [key in WeatherMapType]: MapTileLayer } = {
  precipitation: {
    url: 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png',
    attribution: 'OpenWeatherMap',
    maxZoom: 10,
  },
  temperature: {
    url: 'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png',
    attribution: 'OpenWeatherMap',
    maxZoom: 10,
  },
  wind: {
    url: 'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png',
    attribution: 'OpenWeatherMap',
    maxZoom: 10,
  },
  clouds: {
    url: 'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png',
    attribution: 'OpenWeatherMap',
    maxZoom: 10,
  },
  pressure: {
    url: 'https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png',
    attribution: 'OpenWeatherMap',
    maxZoom: 10,
  },
  visibility: {
    url: 'https://tile.openweathermap.org/map/visibility_new/{z}/{x}/{y}.png',
    attribution: 'OpenWeatherMap',
    maxZoom: 10,
  },
};

export interface WeatherMapLegend {
  type: WeatherMapType;
  colors: {
    value: number;
    color: string;
    label: string;
  }[];
  unit: string;
  description: string;
}

export const WEATHER_MAP_LEGENDS: { [key in WeatherMapType]: WeatherMapLegend } = {
  precipitation: {
    type: 'precipitation',
    colors: [
      { value: 0, color: '#FFFFFF', label: 'No rain' },
      { value: 0.1, color: '#E6F3FF', label: 'Very light' },
      { value: 0.5, color: '#B3D9FF', label: 'Light' },
      { value: 1, color: '#80BFFF', label: 'Moderate' },
      { value: 2, color: '#4DA6FF', label: 'Heavy' },
      { value: 5, color: '#1A8CFF', label: 'Very heavy' },
      { value: 10, color: '#0066CC', label: 'Extreme' },
    ],
    unit: 'mm/h',
    description: 'Precipitation intensity',
  },
  temperature: {
    type: 'temperature',
    colors: [
      { value: -40, color: '#000080', label: '-40°C' },
      { value: -20, color: '#0000FF', label: '-20°C' },
      { value: 0, color: '#00FFFF', label: '0°C' },
      { value: 10, color: '#00FF00', label: '10°C' },
      { value: 20, color: '#FFFF00', label: '20°C' },
      { value: 30, color: '#FF8000', label: '30°C' },
      { value: 40, color: '#FF0000', label: '40°C' },
    ],
    unit: '°C',
    description: 'Surface temperature',
  },
  wind: {
    type: 'wind',
    colors: [
      { value: 0, color: '#FFFFFF', label: 'Calm' },
      { value: 5, color: '#E6F3FF', label: '5 km/h' },
      { value: 10, color: '#B3D9FF', label: '10 km/h' },
      { value: 20, color: '#80BFFF', label: '20 km/h' },
      { value: 40, color: '#4DA6FF', label: '40 km/h' },
      { value: 60, color: '#1A8CFF', label: '60 km/h' },
      { value: 80, color: '#0066CC', label: '80+ km/h' },
    ],
    unit: 'km/h',
    description: 'Wind speed',
  },
  clouds: {
    type: 'clouds',
    colors: [
      { value: 0, color: '#FFFFFF', label: 'Clear' },
      { value: 25, color: '#F0F0F0', label: '25%' },
      { value: 50, color: '#D0D0D0', label: '50%' },
      { value: 75, color: '#A0A0A0', label: '75%' },
      { value: 100, color: '#808080', label: '100%' },
    ],
    unit: '%',
    description: 'Cloud coverage',
  },
  pressure: {
    type: 'pressure',
    colors: [
      { value: 950, color: '#800080', label: '950 hPa' },
      { value: 980, color: '#FF00FF', label: '980 hPa' },
      { value: 1000, color: '#0000FF', label: '1000 hPa' },
      { value: 1020, color: '#00FFFF', label: '1020 hPa' },
      { value: 1040, color: '#00FF00', label: '1040 hPa' },
      { value: 1060, color: '#FFFF00', label: '1060 hPa' },
    ],
    unit: 'hPa',
    description: 'Atmospheric pressure',
  },
  visibility: {
    type: 'visibility',
    colors: [
      { value: 0, color: '#000000', label: '0 km' },
      { value: 1, color: '#800000', label: '1 km' },
      { value: 5, color: '#FF8000', label: '5 km' },
      { value: 10, color: '#FFFF00', label: '10 km' },
      { value: 20, color: '#80FF00', label: '20 km' },
      { value: 50, color: '#00FF80', label: '50+ km' },
    ],
    unit: 'km',
    description: 'Visibility range',
  },
};
