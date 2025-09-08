export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherMain {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

export interface WeatherWind {
  speed: number;
  deg: number;
  gust?: number;
}

export interface WeatherClouds {
  all: number;
}

export interface WeatherRain {
  '1h'?: number;
  '3h'?: number;
}

export interface WeatherSnow {
  '1h'?: number;
  '3h'?: number;
}

export interface WeatherSys {
  type?: number;
  id?: number;
  country?: string;
  sunrise?: number;
  sunset?: number;
}

export interface CurrentWeather {
  coord: {
    lon: number;
    lat: number;
  };
  weather: WeatherCondition[];
  base: string;
  main: WeatherMain;
  visibility: number;
  wind: WeatherWind;
  clouds: WeatherClouds;
  rain?: WeatherRain;
  snow?: WeatherSnow;
  dt: number;
  sys: WeatherSys;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface ForecastItem {
  dt: number;
  main: WeatherMain;
  weather: WeatherCondition[];
  clouds: WeatherClouds;
  wind: WeatherWind;
  visibility: number;
  pop: number;
  rain?: WeatherRain;
  snow?: WeatherSnow;
  sys: {
    pod: string;
  };
  dt_txt: string;
}

export interface WeatherForecast {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface WeatherAlert {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags: string[];
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: WeatherForecast;
  alerts?: WeatherAlert[];
}

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
