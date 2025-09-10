export interface UVIndex {
  value: number;
  category: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  description: string;
  protectionTime: number; // minutes before sunburn
  skinType: 'Type 1' | 'Type 2' | 'Type 3' | 'Type 4' | 'Type 5' | 'Type 6';
}

export interface AirQuality {
  aqi: number;
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  pollutants: {
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
  };
  healthRecommendations: string[];
}

export interface PollenData {
  grass: number;
  tree: number;
  weed: number;
  mold: number;
  overall: number;
  category: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  recommendations: string[];
}

export interface HealthAlert {
  id: string;
  type: 'uv' | 'air_quality' | 'pollen' | 'temperature' | 'humidity' | 'wind';
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  title: string;
  message: string;
  recommendations: string[];
  validUntil: Date;
  isActive: boolean;
}

export interface SkinProtection {
  spf: number;
  reapplyTime: number; // minutes
  clothing: string[];
  accessories: string[];
  timing: {
    avoid: string; // time range to avoid sun
    best: string; // best time for outdoor activities
  };
}

export interface WeatherHealthTips {
  temperature: string[];
  humidity: string[];
  wind: string[];
  precipitation: string[];
  general: string[];
}
