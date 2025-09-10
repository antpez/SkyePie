export interface SatelliteImage {
  id: string;
  timestamp: Date;
  type: 'visible' | 'infrared' | 'water_vapor' | 'precipitation';
  resolution: 'low' | 'medium' | 'high';
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  imageUrl: string;
  thumbnailUrl: string;
  metadata: {
    satellite: string;
    instrument: string;
    processingLevel: string;
    cloudCover: number;
    quality: number;
  };
}

export interface WeatherPattern {
  id: string;
  name: string;
  type: 'cyclone' | 'anticyclone' | 'front' | 'trough' | 'ridge' | 'jet_stream';
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  confidence: number; // 0-100
  location: {
    center: { latitude: number; longitude: number };
    radius: number; // km
  };
  movement: {
    direction: number; // degrees
    speed: number; // km/h
  };
  timeline: {
    start: Date;
    end: Date;
    peak: Date;
  };
  impacts: {
    temperature: { min: number; max: number };
    precipitation: { min: number; max: number };
    wind: { min: number; max: number };
    pressure: { min: number; max: number };
  };
  warnings: string[];
}

export interface SeasonalTrend {
  id: string;
  year: number;
  season: 'spring' | 'summer' | 'fall' | 'winter';
  location: string;
  metrics: {
    averageTemperature: number;
    totalPrecipitation: number;
    averageHumidity: number;
    averageWindSpeed: number;
    extremeEvents: number;
  };
  anomalies: {
    temperature: number; // deviation from normal
    precipitation: number; // deviation from normal
    humidity: number; // deviation from normal
  };
  comparison: {
    previousYear: number; // percentage change
    tenYearAverage: number; // percentage change
    recordYear: number; // percentage change from record
  };
  insights: string[];
}

export interface WeatherHistory {
  id: string;
  location: string;
  date: Date;
  temperature: {
    min: number;
    max: number;
    average: number;
  };
  precipitation: {
    total: number;
    type: string;
    duration: number; // hours
  };
  wind: {
    speed: number;
    direction: number;
    gusts: number;
  };
  humidity: number;
  pressure: number;
  visibility: number;
  conditions: string[];
  records: {
    isRecordHigh: boolean;
    isRecordLow: boolean;
    isRecordPrecipitation: boolean;
  };
}

export interface WeatherPrediction {
  id: string;
  location: string;
  predictionDate: Date;
  targetDate: Date;
  type: 'temperature' | 'precipitation' | 'wind' | 'pressure' | 'humidity';
  predictedValue: number;
  actualValue?: number;
  confidence: number; // 0-100
  method: 'machine_learning' | 'statistical' | 'pattern_recognition' | 'ensemble';
  features: {
    historicalData: boolean;
    satelliteData: boolean;
    patternAnalysis: boolean;
    seasonalTrends: boolean;
  };
  accuracy: number; // 0-100
  isVerified: boolean;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'satellite' | 'radar' | 'station' | 'model' | 'crowdsourced';
  provider: string;
  reliability: number; // 0-100
  updateFrequency: number; // minutes
  coverage: {
    global: boolean;
    regions: string[];
  };
  dataTypes: string[];
  cost: 'free' | 'premium' | 'enterprise';
  apiEndpoint?: string;
  documentation?: string;
}

export interface WeatherInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'trend' | 'prediction' | 'warning';
  title: string;
  description: string;
  confidence: number; // 0-100
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    name: string;
    coordinates: { latitude: number; longitude: number };
    radius: number; // km
  };
  timeframe: {
    start: Date;
    end: Date;
  };
  dataSources: string[];
  recommendations: string[];
  relatedInsights: string[];
}
