export interface MicroWeatherReport {
  id: string;
  userId: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number; // meters
    address?: string;
  };
  timestamp: Date;
  weather: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
    uvIndex: number;
  };
  conditions: {
    sky: 'clear' | 'partly_cloudy' | 'cloudy' | 'overcast';
    precipitation: 'none' | 'light' | 'moderate' | 'heavy';
    precipitationType: 'rain' | 'snow' | 'sleet' | 'hail' | 'none';
    fog: boolean;
    mist: boolean;
    haze: boolean;
  };
  quality: {
    confidence: number; // 0-100
    verification: 'verified' | 'pending' | 'rejected';
    source: 'user_report' | 'sensor' | 'crowdsourced';
  };
  photos?: string[];
  notes?: string;
}

export interface TrafficWeatherImpact {
  id: string;
  location: string;
  timestamp: Date;
  weather: {
    condition: string;
    temperature: number;
    precipitation: number;
    visibility: number;
    windSpeed: number;
  };
  traffic: {
    speed: number; // km/h
    density: 'low' | 'medium' | 'high' | 'severe';
    delay: number; // minutes
    incidents: number;
  };
  impact: {
    severity: 'low' | 'medium' | 'high' | 'extreme';
    description: string;
    recommendations: string[];
  };
  correlation: {
    weatherFactor: number; // 0-1
    trafficFactor: number; // 0-1
    combinedImpact: number; // 0-1
  };
}

export interface NeighborhoodWeather {
  id: string;
  name: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number; // meters
  reports: MicroWeatherReport[];
  aggregated: {
    temperature: {
      average: number;
      min: number;
      max: number;
      standardDeviation: number;
    };
    humidity: {
      average: number;
      min: number;
      max: number;
    };
    precipitation: {
      total: number;
      intensity: 'light' | 'moderate' | 'heavy';
      duration: number; // minutes
    };
    wind: {
      averageSpeed: number;
      maxSpeed: number;
      dominantDirection: number;
    };
  };
  confidence: number; // 0-100
  lastUpdated: Date;
  microClimate: {
    type: 'urban_heat_island' | 'valley_cooling' | 'coastal_breeze' | 'mountain_effect' | 'lake_effect' | 'forest_cooling' | 'normal';
    description: string;
    intensity: 'low' | 'medium' | 'high';
  };
}

export interface CrowdsourcedData {
  id: string;
  type: 'weather_report' | 'traffic_update' | 'incident_report' | 'photo_verification';
  userId: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: Date;
  data: Record<string, any>;
  verification: {
    status: 'pending' | 'verified' | 'rejected';
    verifiedBy: string[];
    confidence: number;
    method: 'automatic' | 'peer_review' | 'expert_review';
  };
  quality: {
    score: number; // 0-100
    factors: {
      accuracy: number;
      completeness: number;
      timeliness: number;
      reliability: number;
    };
  };
}

export interface MicroClimateDetection {
  id: string;
  location: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  type: 'urban_heat_island' | 'valley_cooling' | 'coastal_breeze' | 'mountain_effect' | 'lake_effect' | 'forest_cooling';
  intensity: 'low' | 'medium' | 'high' | 'extreme';
  description: string;
  characteristics: {
    temperatureDifference: number; // °C from surrounding areas
    humidityDifference: number; // % from surrounding areas
    windPattern: string;
    precipitationPattern: string;
  };
  causes: string[];
  impacts: string[];
  recommendations: string[];
  confidence: number; // 0-100
  lastUpdated: Date;
}

export interface HyperlocalSettings {
  dataCollection: {
    enabled: boolean;
    autoReport: boolean;
    reportInterval: number; // minutes
    accuracyThreshold: number; // meters
  };
  crowdsourcing: {
    enabled: boolean;
    verificationRequired: boolean;
    peerReview: boolean;
    expertReview: boolean;
  };
  privacy: {
    locationSharing: boolean;
    dataSharing: boolean;
    anonymization: boolean;
    retentionPeriod: number; // days
  };
  notifications: {
    microWeatherAlerts: boolean;
    trafficImpacts: boolean;
    neighborhoodUpdates: boolean;
    verificationRequests: boolean;
  };
}
