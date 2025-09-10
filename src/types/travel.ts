export interface TravelDestination {
  id: string;
  name: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
  bestTimeToVisit: {
    start: string; // Month name
    end: string; // Month name
    reason: string;
  };
  weatherPatterns: {
    summer: WeatherSeason;
    winter: WeatherSeason;
    spring: WeatherSeason;
    fall: WeatherSeason;
  };
  attractions: string[];
  packingRecommendations: string[];
}

export interface WeatherSeason {
  averageTemp: number;
  minTemp: number;
  maxTemp: number;
  precipitation: number;
  humidity: number;
  conditions: string[];
  description: string;
}

export interface TravelPlan {
  id: string;
  destination: TravelDestination;
  startDate: Date;
  endDate: Date;
  weatherForecast: {
    date: Date;
    temperature: number;
    condition: string;
    precipitation: number;
    windSpeed: number;
    humidity: number;
  }[];
  recommendations: {
    clothing: string[];
    activities: string[];
    precautions: string[];
  };
  packingList: PackingItem[];
}

export interface PackingItem {
  category: 'clothing' | 'accessories' | 'electronics' | 'toiletries' | 'documents' | 'other';
  item: string;
  quantity: number;
  priority: 'essential' | 'recommended' | 'optional';
  reason: string;
}

export interface MultiCityWeather {
  cities: {
    name: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    currentWeather: {
      temperature: number;
      condition: string;
      humidity: number;
      windSpeed: number;
    };
    forecast: {
      date: Date;
      temperature: number;
      condition: string;
    }[];
  }[];
  lastUpdated: Date;
}

export interface FlightWeatherImpact {
  flightId: string;
  departure: {
    airport: string;
    city: string;
    weather: {
      condition: string;
      temperature: number;
      windSpeed: number;
      visibility: number;
    };
    delayRisk: 'low' | 'medium' | 'high';
    delayReason?: string;
  };
  arrival: {
    airport: string;
    city: string;
    weather: {
      condition: string;
      temperature: number;
      windSpeed: number;
      visibility: number;
    };
    delayRisk: 'low' | 'medium' | 'high';
    delayReason?: string;
  };
  overallDelayRisk: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface TravelRecommendation {
  destination: string;
  reason: string;
  weatherScore: number; // 0-100
  bestTime: string;
  activities: string[];
  packingTips: string[];
  weatherAlerts: string[];
}
