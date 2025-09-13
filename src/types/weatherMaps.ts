export type WeatherMapType = 
  | 'precipitation' | 'temperature' | 'wind' | 'clouds' | 'pressure' | 'visibility'
  | 'convective_precipitation' | 'precipitation_intensity' | 'rain_accumulation' | 'snow_accumulation'
  | 'snow_depth' | 'wind_speed' | 'wind_arrows' | 'atmospheric_pressure' | 'air_temperature'
  | 'dew_point' | 'soil_temperature' | 'soil_temperature_deep' | 'humidity';

export interface WeatherMapLayer {
  id: string;
  name: string;
  description: string;
  type: WeatherMapType;
  opacity: number;
  visible: boolean;
  zIndex: number;
  category: 'precipitation' | 'temperature' | 'wind' | 'pressure' | 'moisture' | 'soil';
  icon: string;
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
    id: 'rain_accumulation',
    name: 'Rain Accumulation',
    description: 'Accumulated rain',
    type: 'rain_accumulation',
    opacity: 0.6,
    visible: true,
    zIndex: 1,
    category: 'precipitation',
    icon: '💧',
  },
  {
    id: 'clouds_new',
    name: 'Clouds',
    description: 'Cloud coverage',
    type: 'clouds_new',
    opacity: 0.7,
    visible: false,
    zIndex: 2,
    category: 'clouds',
    icon: '☁️',
  },
  {
    id: 'wind_speed',
    name: 'Wind Speed',
    description: 'Wind speed at 10 meters altitude',
    type: 'wind_speed',
    opacity: 0.7,
    visible: false,
    zIndex: 3,
    category: 'wind',
    icon: '🌪️',
  },
  {
    id: 'wind_arrows',
    name: 'Wind Arrows',
    description: 'Wind speed and direction with arrows',
    type: 'wind_arrows',
    opacity: 0.8,
    visible: false,
    zIndex: 4,
    category: 'wind',
    icon: '💨',
  },
  {
    id: 'air_temperature',
    name: 'Air Temperature',
    description: 'Temperature at 2 meters',
    type: 'air_temperature',
    opacity: 0.6,
    visible: false,
    zIndex: 5,
    category: 'temperature',
    icon: '🌡️',
  },
  {
    id: 'snow_accumulation',
    name: 'Snow Accumulation',
    description: 'Accumulated snow',
    type: 'snow_accumulation',
    opacity: 0.6,
    visible: false,
    zIndex: 6,
    category: 'precipitation',
    icon: '❄️',
  },
  {
    id: 'snow_depth',
    name: 'Snow Depth',
    description: 'Snow depth',
    type: 'snow_depth',
    opacity: 0.6,
    visible: false,
    zIndex: 7,
    category: 'precipitation',
    icon: '🏔️',
  },
];

// OpenWeatherMap Weather Maps 2.0 API layer codes
export const WEATHER_MAP_LAYER_CODES: { [key in WeatherMapType]: string } = {
  // Legacy types (for backward compatibility)
  precipitation: 'PR0',
  temperature: 'TA2',
  wind: 'WNDUV',
  clouds: 'CL',
  pressure: 'APM',
  visibility: 'VIS',
  
  // New Weather Maps 2.0 types
  convective_precipitation: 'PAC0',
  precipitation_intensity: 'PR0',
  rain_accumulation: 'PARAIN',
  snow_accumulation: 'PASNOW',
  snow_depth: 'SD0',
  wind_speed: 'WS10UV',
  wind_arrows: 'WNDUV',
  atmospheric_pressure: 'APM',
  air_temperature: 'TA2',
  dew_point: 'TD2',
  soil_temperature: 'TS0',
  soil_temperature_deep: 'TS10',
  humidity: 'HRD0',
};

export const WEATHER_MAP_TILE_LAYERS: { [key in WeatherMapType]: MapTileLayer } = {
  precipitation: {
    url: 'https://maps.openweathermap.org/maps/2.0/weather/1h/PR0/{z}/{x}/{y}?appid={API_KEY}',
    attribution: 'OpenWeatherMap',
    maxZoom: 18,
  },
  temperature: {
    url: 'https://maps.openweathermap.org/maps/2.0/weather/1h/TA2/{z}/{x}/{y}?appid={API_KEY}',
    attribution: 'OpenWeatherMap',
    maxZoom: 18,
  },
  wind: {
    url: 'https://maps.openweathermap.org/maps/2.0/weather/1h/WNDUV/{z}/{x}/{y}?appid={API_KEY}',
    attribution: 'OpenWeatherMap',
    maxZoom: 18,
  },
  clouds: {
    url: 'https://maps.openweathermap.org/maps/2.0/weather/1h/CL/{z}/{x}/{y}?appid={API_KEY}',
    attribution: 'OpenWeatherMap',
    maxZoom: 18,
  },
  pressure: {
    url: 'https://maps.openweathermap.org/maps/2.0/weather/1h/APM/{z}/{x}/{y}?appid={API_KEY}',
    attribution: 'OpenWeatherMap',
    maxZoom: 18,
  },
  visibility: {
    url: 'https://maps.openweathermap.org/maps/2.0/weather/1h/VIS/{z}/{x}/{y}?appid={API_KEY}',
    attribution: 'OpenWeatherMap',
    maxZoom: 18,
  },
  // New Weather Maps 2.0 types
  convective_precipitation: {
    url: 'https://maps.openweathermap.org/maps/2.0/weather/1h/PAC0/{z}/{x}/{y}?appid={API_KEY}',
    attribution: 'OpenWeatherMap',
    maxZoom: 18,
  },
  precipitation_intensity: {
    url: 'https://tile.openweathermap.org/map/precipitation/{z}/{x}/{y}.png?appid={API_KEY}',
    attribution: 'OpenWeatherMap',
    maxZoom: 18,
  },
  rain_accumulation: {
    url: 'https://maps.openweathermap.org/maps/2.0/weather/1h/PARAIN/{z}/{x}/{y}?appid={API_KEY}',
    attribution: 'OpenWeatherMap',
    maxZoom: 18,
  },
  snow_accumulation: {
    url: 'https://maps.openweathermap.org/maps/2.0/weather/1h/PASNOW/{z}/{x}/{y}?appid={API_KEY}',
    attribution: 'OpenWeatherMap',
    maxZoom: 18,
  },
  snow_depth: {
    url: 'https://maps.openweathermap.org/maps/2.0/weather/1h/SD0/{z}/{x}/{y}?appid={API_KEY}',
    attribution: 'OpenWeatherMap',
    maxZoom: 18,
  },
  wind_speed: {
    url: 'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid={API_KEY}',
    attribution: 'OpenWeatherMap',
    maxZoom: 18,
  },
  wind_arrows: {
    url: 'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid={API_KEY}',
    attribution: 'OpenWeatherMap',
    maxZoom: 18,
  },
  atmospheric_pressure: {
    url: 'https://maps.openweathermap.org/maps/2.0/weather/1h/APM/{z}/{x}/{y}?appid={API_KEY}',
    attribution: 'OpenWeatherMap',
    maxZoom: 18,
  },
  air_temperature: {
    url: 'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid={API_KEY}',
    attribution: 'OpenWeatherMap',
    maxZoom: 18,
  },
  clouds_new: {
    url: 'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid={API_KEY}',
    attribution: 'OpenWeatherMap',
    maxZoom: 18,
  },
  dew_point: {
    url: 'https://maps.openweathermap.org/maps/2.0/weather/1h/TD2/{z}/{x}/{y}?appid={API_KEY}',
    attribution: 'OpenWeatherMap',
    maxZoom: 18,
  },
  soil_temperature: {
    url: 'https://maps.openweathermap.org/maps/2.0/weather/1h/TS0/{z}/{x}/{y}?appid={API_KEY}',
    attribution: 'OpenWeatherMap',
    maxZoom: 18,
  },
  soil_temperature_deep: {
    url: 'https://maps.openweathermap.org/maps/2.0/weather/1h/TS10/{z}/{x}/{y}?appid={API_KEY}',
    attribution: 'OpenWeatherMap',
    maxZoom: 18,
  },
  humidity: {
    url: 'https://maps.openweathermap.org/maps/2.0/weather/1h/HRD0/{z}/{x}/{y}?appid={API_KEY}',
    attribution: 'OpenWeatherMap',
    maxZoom: 18,
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
  // Legacy types
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
  
  // New Weather Maps 2.0 types
  convective_precipitation: {
    type: 'convective_precipitation',
    colors: [
      { value: 0, color: '#FFFFFF', label: 'No rain' },
      { value: 0.1, color: '#E6F3FF', label: 'Very light' },
      { value: 0.5, color: '#B3D9FF', label: 'Light' },
      { value: 1, color: '#80BFFF', label: 'Moderate' },
      { value: 2, color: '#4DA6FF', label: 'Heavy' },
      { value: 5, color: '#1A8CFF', label: 'Very heavy' },
      { value: 10, color: '#0066CC', label: 'Extreme' },
    ],
    unit: 'mm',
    description: 'Convective precipitation',
  },
  precipitation_intensity: {
    type: 'precipitation_intensity',
    colors: [
      { value: 0, color: '#FFFFFF', label: 'No rain' },
      { value: 0.1, color: '#E6F3FF', label: 'Very light' },
      { value: 0.5, color: '#B3D9FF', label: 'Light' },
      { value: 1, color: '#80BFFF', label: 'Moderate' },
      { value: 2, color: '#4DA6FF', label: 'Heavy' },
      { value: 5, color: '#1A8CFF', label: 'Very heavy' },
      { value: 10, color: '#0066CC', label: 'Extreme' },
    ],
    unit: 'mm/s',
    description: 'Precipitation intensity',
  },
  rain_accumulation: {
    type: 'rain_accumulation',
    colors: [
      { value: 0, color: '#FFFFFF', label: 'No rain' },
      { value: 0.1, color: '#E6F3FF', label: '0.1 mm' },
      { value: 0.5, color: '#B3D9FF', label: '0.5 mm' },
      { value: 1, color: '#80BFFF', label: '1 mm' },
      { value: 5, color: '#4DA6FF', label: '5 mm' },
      { value: 10, color: '#1A8CFF', label: '10 mm' },
      { value: 20, color: '#0066CC', label: '20+ mm' },
    ],
    unit: 'mm',
    description: 'Rain accumulation',
  },
  snow_accumulation: {
    type: 'snow_accumulation',
    colors: [
      { value: 0, color: '#FFFFFF', label: 'No snow' },
      { value: 5, color: '#E6F3FF', label: '5 mm' },
      { value: 10, color: '#B3D9FF', label: '10 mm' },
      { value: 25, color: '#80BFFF', label: '25 mm' },
      { value: 50, color: '#4DA6FF', label: '50 mm' },
      { value: 100, color: '#1A8CFF', label: '100 mm' },
      { value: 200, color: '#0066CC', label: '200+ mm' },
    ],
    unit: 'mm',
    description: 'Snow accumulation',
  },
  snow_depth: {
    type: 'snow_depth',
    colors: [
      { value: 0, color: '#FFFFFF', label: 'No snow' },
      { value: 0.05, color: '#E6F3FF', label: '5 cm' },
      { value: 0.1, color: '#B3D9FF', label: '10 cm' },
      { value: 0.2, color: '#80BFFF', label: '20 cm' },
      { value: 0.5, color: '#4DA6FF', label: '50 cm' },
      { value: 1, color: '#1A8CFF', label: '1 m' },
      { value: 2, color: '#0066CC', label: '2+ m' },
    ],
    unit: 'm',
    description: 'Snow depth',
  },
  wind_speed: {
    type: 'wind_speed',
    colors: [
      { value: 0, color: '#FFFFFF', label: 'Calm' },
      { value: 1, color: '#E6F3FF', label: '1 m/s' },
      { value: 5, color: '#B3D9FF', label: '5 m/s' },
      { value: 10, color: '#80BFFF', label: '10 m/s' },
      { value: 20, color: '#4DA6FF', label: '20 m/s' },
      { value: 50, color: '#1A8CFF', label: '50 m/s' },
      { value: 100, color: '#0066CC', label: '100+ m/s' },
    ],
    unit: 'm/s',
    description: 'Wind speed at 10m',
  },
  wind_arrows: {
    type: 'wind_arrows',
    colors: [
      { value: 0, color: '#FFFFFF', label: 'Calm' },
      { value: 1, color: '#E6F3FF', label: '1 m/s' },
      { value: 5, color: '#B3D9FF', label: '5 m/s' },
      { value: 10, color: '#80BFFF', label: '10 m/s' },
      { value: 20, color: '#4DA6FF', label: '20 m/s' },
      { value: 50, color: '#1A8CFF', label: '50 m/s' },
      { value: 100, color: '#0066CC', label: '100+ m/s' },
    ],
    unit: 'm/s',
    description: 'Wind speed and direction',
  },
  atmospheric_pressure: {
    type: 'atmospheric_pressure',
    colors: [
      { value: 940, color: '#800080', label: '940 hPa' },
      { value: 960, color: '#FF00FF', label: '960 hPa' },
      { value: 980, color: '#0000FF', label: '980 hPa' },
      { value: 1000, color: '#00FFFF', label: '1000 hPa' },
      { value: 1020, color: '#00FF00', label: '1020 hPa' },
      { value: 1040, color: '#FFFF00', label: '1040 hPa' },
      { value: 1060, color: '#FF8000', label: '1060 hPa' },
    ],
    unit: 'hPa',
    description: 'Atmospheric pressure',
  },
  air_temperature: {
    type: 'air_temperature',
    colors: [
      { value: -65, color: '#821692', label: '-65°C' },
      { value: -40, color: '#8257DB', label: '-40°C' },
      { value: -20, color: '#208CEC', label: '-20°C' },
      { value: 0, color: '#23DDDD', label: '0°C' },
      { value: 10, color: '#C2FF28', label: '10°C' },
      { value: 20, color: '#FFF028', label: '20°C' },
      { value: 30, color: '#FC8014', label: '30°C' },
    ],
    unit: '°C',
    description: 'Air temperature at 2m',
  },
  dew_point: {
    type: 'dew_point',
    colors: [
      { value: -65, color: '#821692', label: '-65°C' },
      { value: -40, color: '#8257DB', label: '-40°C' },
      { value: -20, color: '#208CEC', label: '-20°C' },
      { value: 0, color: '#23DDDD', label: '0°C' },
      { value: 10, color: '#C2FF28', label: '10°C' },
      { value: 20, color: '#FFF028', label: '20°C' },
      { value: 30, color: '#FC8014', label: '30°C' },
    ],
    unit: '°C',
    description: 'Dew point temperature',
  },
  soil_temperature: {
    type: 'soil_temperature',
    colors: [
      { value: 203, color: '#491763', label: '-70°C' },
      { value: 228, color: '#4E1378', label: '-45°C' },
      { value: 243, color: '#5C85B7', label: '-30°C' },
      { value: 255, color: '#6CBCD4', label: '-18°C' },
      { value: 263, color: '#A7D8E5', label: '-10°C' },
      { value: 275, color: '#FEFEBB', label: '2°C' },
      { value: 295, color: '#E8706E', label: '22°C' },
    ],
    unit: 'K',
    description: 'Soil temperature 0-10cm',
  },
  soil_temperature_deep: {
    type: 'soil_temperature_deep',
    colors: [
      { value: 203, color: '#491763', label: '-70°C' },
      { value: 228, color: '#4E1378', label: '-45°C' },
      { value: 243, color: '#5C85B7', label: '-30°C' },
      { value: 255, color: '#6CBCD4', label: '-18°C' },
      { value: 263, color: '#A7D8E5', label: '-10°C' },
      { value: 275, color: '#FEFEBB', label: '2°C' },
      { value: 295, color: '#E8706E', label: '22°C' },
    ],
    unit: 'K',
    description: 'Soil temperature >10cm',
  },
  humidity: {
    type: 'humidity',
    colors: [
      { value: 0, color: '#db1200', label: '0%' },
      { value: 20, color: '#965700', label: '20%' },
      { value: 40, color: '#ede100', label: '40%' },
      { value: 60, color: '#8bd600', label: '60%' },
      { value: 80, color: '#00a808', label: '80%' },
      { value: 100, color: '#000099', label: '100%' },
    ],
    unit: '%',
    description: 'Relative humidity',
  },
};
