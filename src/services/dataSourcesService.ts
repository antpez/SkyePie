import { 
  SatelliteImage, 
  WeatherPattern, 
  SeasonalTrend, 
  WeatherHistory, 
  WeatherPrediction, 
  DataSource, 
  WeatherInsight 
} from '../types/dataSources';
import { CurrentWeather, WeatherForecast } from '../types/weather';

export class DataSourcesService {
  private static instance: DataSourcesService;
  private dataSources: DataSource[] = [];
  private weatherHistory: WeatherHistory[] = [];
  private predictions: WeatherPrediction[] = [];

  constructor() {
    this.initializeDataSources();
    this.generateSampleHistory();
  }

  static getInstance(): DataSourcesService {
    if (!DataSourcesService.instance) {
      DataSourcesService.instance = new DataSourcesService();
    }
    return DataSourcesService.instance;
  }

  private initializeDataSources() {
    this.dataSources = [
      {
        id: 'noaa_goes',
        name: 'NOAA GOES Satellite',
        type: 'satellite',
        provider: 'NOAA',
        reliability: 95,
        updateFrequency: 15,
        coverage: { global: false, regions: ['North America', 'South America'] },
        dataTypes: ['visible', 'infrared', 'water_vapor'],
        cost: 'free',
        apiEndpoint: 'https://api.noaa.gov/goes',
        documentation: 'https://www.goes.noaa.gov/'
      },
      {
        id: 'eumetsat',
        name: 'EUMETSAT Satellite',
        type: 'satellite',
        provider: 'EUMETSAT',
        reliability: 98,
        updateFrequency: 15,
        coverage: { global: false, regions: ['Europe', 'Africa', 'Middle East'] },
        dataTypes: ['visible', 'infrared', 'water_vapor', 'precipitation'],
        cost: 'free',
        apiEndpoint: 'https://api.eumetsat.int/',
        documentation: 'https://www.eumetsat.int/'
      },
      {
        id: 'openweather_radar',
        name: 'OpenWeatherMap Radar',
        type: 'radar',
        provider: 'OpenWeatherMap',
        reliability: 85,
        updateFrequency: 10,
        coverage: { global: true, regions: [] },
        dataTypes: ['precipitation', 'clouds', 'temperature'],
        cost: 'premium',
        apiEndpoint: 'https://api.openweathermap.org/data/2.5/weather',
        documentation: 'https://openweathermap.org/api'
      },
      {
        id: 'weather_stations',
        name: 'Weather Stations Network',
        type: 'station',
        provider: 'Various',
        reliability: 90,
        updateFrequency: 5,
        coverage: { global: true, regions: [] },
        dataTypes: ['temperature', 'humidity', 'pressure', 'wind', 'precipitation'],
        cost: 'free',
        documentation: 'https://www.wunderground.com/weather-stations/'
      },
      {
        id: 'gfs_model',
        name: 'GFS Weather Model',
        type: 'model',
        provider: 'NOAA',
        reliability: 80,
        updateFrequency: 360,
        coverage: { global: true, regions: [] },
        dataTypes: ['temperature', 'precipitation', 'wind', 'pressure', 'humidity'],
        cost: 'free',
        apiEndpoint: 'https://nomads.ncep.noaa.gov/dods/gfs_0p25',
        documentation: 'https://www.ncei.noaa.gov/products/weather-climate-models/global-forecast'
      }
    ];
  }

  private generateSampleHistory() {
    // Generate sample weather history for the past 30 days
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const temperature = 15 + Math.random() * 20; // 15-35°C
      const precipitation = Math.random() * 20; // 0-20mm
      const windSpeed = Math.random() * 15; // 0-15 m/s
      const humidity = 40 + Math.random() * 40; // 40-80%
      const pressure = 1000 + Math.random() * 50; // 1000-1050 hPa
      
      this.weatherHistory.push({
        id: `history_${date.getTime()}`,
        location: 'Current Location',
        date,
        temperature: {
          min: temperature - 5,
          max: temperature + 5,
          average: temperature
        },
        precipitation: {
          total: precipitation,
          type: precipitation > 10 ? 'Rain' : precipitation > 5 ? 'Drizzle' : 'None',
          duration: precipitation > 0 ? Math.random() * 8 : 0
        },
        wind: {
          speed: windSpeed,
          direction: Math.random() * 360,
          gusts: windSpeed + Math.random() * 5
        },
        humidity,
        pressure,
        visibility: 10 - Math.random() * 5, // 5-10 km
        conditions: this.generateConditions(temperature, precipitation, humidity),
        records: {
          isRecordHigh: temperature > 35,
          isRecordLow: temperature < 10,
          isRecordPrecipitation: precipitation > 50
        }
      });
    }
  }

  private generateConditions(temp: number, precip: number, humidity: number): string[] {
    const conditions = [];
    
    if (precip > 10) {
      conditions.push('Rain');
    } else if (precip > 5) {
      conditions.push('Drizzle');
    }
    
    if (temp > 30) {
      conditions.push('Hot');
    } else if (temp < 10) {
      conditions.push('Cold');
    }
    
    if (humidity > 80) {
      conditions.push('Humid');
    } else if (humidity < 30) {
      conditions.push('Dry');
    }
    
    if (conditions.length === 0) {
      conditions.push('Clear');
    }
    
    return conditions;
  }

  getSatelliteImages(type: 'visible' | 'infrared' | 'water_vapor' | 'precipitation', count: number = 5): SatelliteImage[] {
    const images: SatelliteImage[] = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      const timestamp = new Date(now.getTime() - i * 15 * 60 * 1000); // 15 minutes apart
      
      images.push({
        id: `sat_${type}_${timestamp.getTime()}`,
        timestamp,
        type,
        resolution: 'medium',
        bounds: { north: 85, south: -85, east: 180, west: -180 },
        imageUrl: `https://api.example.com/satellite/${type}/${timestamp.getTime()}.png`,
        thumbnailUrl: `https://api.example.com/satellite/${type}/${timestamp.getTime()}_thumb.png`,
        metadata: {
          satellite: 'GOES-16',
          instrument: 'ABI',
          processingLevel: 'L2',
          cloudCover: Math.random() * 100,
          quality: 85 + Math.random() * 15
        }
      });
    }
    
    return images;
  }

  detectWeatherPatterns(weatherData: CurrentWeather, forecast: WeatherForecast): WeatherPattern[] {
    const patterns: WeatherPattern[] = [];
    const temp = weatherData.main.temp;
    const pressure = weatherData.main.pressure;
    const windSpeed = weatherData.wind.speed;
    const humidity = weatherData.main.humidity;
    
    // Detect high pressure system
    if (pressure > 1020) {
      patterns.push({
        id: `pattern_high_pressure_${Date.now()}`,
        name: 'High Pressure System',
        type: 'anticyclone',
        description: 'High pressure system bringing clear, stable weather',
        severity: 'low',
        confidence: 85,
        location: {
          center: { latitude: 40.7128, longitude: -74.0060 },
          radius: 500
        },
        movement: {
          direction: 90,
          speed: 20
        },
        timeline: {
          start: new Date(),
          end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          peak: new Date(Date.now() + 24 * 60 * 60 * 1000)
        },
        impacts: {
          temperature: { min: temp - 5, max: temp + 5 },
          precipitation: { min: 0, max: 5 },
          wind: { min: 0, max: 10 },
          pressure: { min: pressure - 10, max: pressure + 10 }
        },
        warnings: ['Clear skies expected', 'Low chance of precipitation']
      });
    }
    
    // Detect low pressure system
    if (pressure < 1000) {
      patterns.push({
        id: `pattern_low_pressure_${Date.now()}`,
        name: 'Low Pressure System',
        type: 'cyclone',
        description: 'Low pressure system bringing stormy weather',
        severity: 'high',
        confidence: 90,
        location: {
          center: { latitude: 40.7128, longitude: -74.0060 },
          radius: 300
        },
        movement: {
          direction: 270,
          speed: 30
        },
        timeline: {
          start: new Date(),
          end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          peak: new Date(Date.now() + 12 * 60 * 60 * 1000)
        },
        impacts: {
          temperature: { min: temp - 10, max: temp + 5 },
          precipitation: { min: 10, max: 50 },
          wind: { min: 15, max: 40 },
          pressure: { min: pressure - 20, max: pressure + 5 }
        },
        warnings: ['Heavy rain expected', 'Strong winds possible', 'Potential flooding']
      });
    }
    
    // Detect front
    if (Math.abs(forecast.list[0].main.temp - forecast.list[4].main.temp) > 10) {
      patterns.push({
        id: `pattern_front_${Date.now()}`,
        name: 'Weather Front',
        type: 'front',
        description: 'Weather front causing temperature and condition changes',
        severity: 'moderate',
        confidence: 75,
        location: {
          center: { latitude: 40.7128, longitude: -74.0060 },
          radius: 200
        },
        movement: {
          direction: 180,
          speed: 25
        },
        timeline: {
          start: new Date(),
          end: new Date(Date.now() + 6 * 60 * 60 * 1000),
          peak: new Date(Date.now() + 3 * 60 * 60 * 1000)
        },
        impacts: {
          temperature: { min: temp - 15, max: temp + 10 },
          precipitation: { min: 5, max: 30 },
          wind: { min: 10, max: 25 },
          pressure: { min: pressure - 15, max: pressure + 10 }
        },
        warnings: ['Temperature drop expected', 'Windy conditions', 'Possible precipitation']
      });
    }
    
    return patterns;
  }

  analyzeSeasonalTrends(location: string, year: number): SeasonalTrend[] {
    const trends: SeasonalTrend[] = [];
    const seasons = ['spring', 'summer', 'fall', 'winter'] as const;
    
    seasons.forEach(season => {
      const baseTemp = this.getSeasonalBaseTemp(season);
      const basePrecip = this.getSeasonalBasePrecip(season);
      const baseHumidity = this.getSeasonalBaseHumidity(season);
      
      const trend: SeasonalTrend = {
        id: `trend_${season}_${year}`,
        year,
        season,
        location,
        metrics: {
          averageTemperature: baseTemp + (Math.random() - 0.5) * 4,
          totalPrecipitation: basePrecip + (Math.random() - 0.5) * 100,
          averageHumidity: baseHumidity + (Math.random() - 0.5) * 20,
          averageWindSpeed: 8 + Math.random() * 4,
          extremeEvents: Math.floor(Math.random() * 5)
        },
        anomalies: {
          temperature: (Math.random() - 0.5) * 3,
          precipitation: (Math.random() - 0.5) * 50,
          humidity: (Math.random() - 0.5) * 15
        },
        comparison: {
          previousYear: (Math.random() - 0.5) * 20,
          tenYearAverage: (Math.random() - 0.5) * 15,
          recordYear: (Math.random() - 0.5) * 30
        },
        insights: this.generateSeasonalInsights(season, baseTemp, basePrecip)
      };
      
      trends.push(trend);
    });
    
    return trends;
  }

  private getSeasonalBaseTemp(season: string): number {
    switch (season) {
      case 'spring': return 15;
      case 'summer': return 25;
      case 'fall': return 18;
      case 'winter': return 5;
      default: return 15;
    }
  }

  private getSeasonalBasePrecip(season: string): number {
    switch (season) {
      case 'spring': return 80;
      case 'summer': return 60;
      case 'fall': return 90;
      case 'winter': return 70;
      default: return 75;
    }
  }

  private getSeasonalBaseHumidity(season: string): number {
    switch (season) {
      case 'spring': return 65;
      case 'summer': return 70;
      case 'fall': return 75;
      case 'winter': return 60;
      default: return 67;
    }
  }

  private generateSeasonalInsights(season: string, temp: number, precip: number): string[] {
    const insights = [];
    
    if (season === 'summer' && temp > 28) {
      insights.push('Warmer than average summer temperatures');
    }
    
    if (season === 'winter' && temp < 0) {
      insights.push('Colder than average winter temperatures');
    }
    
    if (precip > 100) {
      insights.push('Above average precipitation for the season');
    } else if (precip < 50) {
      insights.push('Below average precipitation for the season');
    }
    
    if (season === 'spring' && temp > 20) {
      insights.push('Early spring warming trend');
    }
    
    return insights;
  }

  getWeatherHistory(location: string, startDate: Date, endDate: Date): WeatherHistory[] {
    return this.weatherHistory.filter(history => 
      history.location === location &&
      history.date >= startDate &&
      history.date <= endDate
    );
  }

  generateWeatherPrediction(
    location: string,
    targetDate: Date,
    type: 'temperature' | 'precipitation' | 'wind' | 'pressure' | 'humidity',
    method: 'machine_learning' | 'statistical' | 'pattern_recognition' | 'ensemble'
  ): WeatherPrediction {
    const prediction: WeatherPrediction = {
      id: `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      location,
      predictionDate: new Date(),
      targetDate,
      type,
      predictedValue: this.generatePredictedValue(type),
      confidence: 70 + Math.random() * 25,
      method,
      features: {
        historicalData: true,
        satelliteData: Math.random() > 0.5,
        patternAnalysis: true,
        seasonalTrends: true
      },
      accuracy: 0,
      isVerified: false
    };
    
    this.predictions.push(prediction);
    return prediction;
  }

  private generatePredictedValue(type: string): number {
    switch (type) {
      case 'temperature':
        return 15 + Math.random() * 20;
      case 'precipitation':
        return Math.random() * 50;
      case 'wind':
        return Math.random() * 20;
      case 'pressure':
        return 1000 + Math.random() * 50;
      case 'humidity':
        return 30 + Math.random() * 50;
      default:
        return Math.random() * 100;
    }
  }

  generateWeatherInsights(weatherData: CurrentWeather, forecast: WeatherForecast): WeatherInsight[] {
    const insights: WeatherInsight[] = [];
    const temp = weatherData.main.temp;
    const pressure = weatherData.main.pressure;
    const humidity = weatherData.main.humidity;
    
    // Temperature anomaly insight
    if (temp > 30) {
      insights.push({
        id: `insight_high_temp_${Date.now()}`,
        type: 'anomaly',
        title: 'Unusually High Temperature',
        description: `Temperature is ${temp}°C, which is significantly above normal for this time of year`,
        confidence: 90,
        severity: 'medium',
        location: {
          name: 'Current Location',
          coordinates: { latitude: 40.7128, longitude: -74.0060 },
          radius: 50
        },
        timeframe: {
          start: new Date(),
          end: new Date(Date.now() + 24 * 60 * 60 * 1000)
        },
        dataSources: ['weather_stations', 'satellite'],
        recommendations: [
          'Stay hydrated and avoid prolonged sun exposure',
          'Use air conditioning if available',
          'Check on elderly and vulnerable individuals'
        ],
        relatedInsights: []
      });
    }
    
    // Pressure trend insight
    if (pressure < 1000) {
      insights.push({
        id: `insight_low_pressure_${Date.now()}`,
        type: 'warning',
        title: 'Low Pressure System Approaching',
        description: `Barometric pressure is ${pressure} hPa, indicating a low pressure system that may bring stormy weather`,
        confidence: 85,
        severity: 'high',
        location: {
          name: 'Current Location',
          coordinates: { latitude: 40.7128, longitude: -74.0060 },
          radius: 100
        },
        timeframe: {
          start: new Date(),
          end: new Date(Date.now() + 12 * 60 * 60 * 1000)
        },
        dataSources: ['weather_stations', 'gfs_model'],
        recommendations: [
          'Prepare for possible severe weather',
          'Secure outdoor objects',
          'Monitor weather updates closely'
        ],
        relatedInsights: []
      });
    }
    
    // Humidity pattern insight
    if (humidity > 80) {
      insights.push({
        id: `insight_high_humidity_${Date.now()}`,
        type: 'pattern',
        title: 'High Humidity Conditions',
        description: `Humidity is at ${humidity}%, creating muggy conditions that may affect comfort and health`,
        confidence: 95,
        severity: 'low',
        location: {
          name: 'Current Location',
          coordinates: { latitude: 40.7128, longitude: -74.0060 },
          radius: 25
        },
        timeframe: {
          start: new Date(),
          end: new Date(Date.now() + 6 * 60 * 60 * 1000)
        },
        dataSources: ['weather_stations'],
        recommendations: [
          'Use dehumidifier if available',
          'Avoid strenuous outdoor activities',
          'Stay cool and hydrated'
        ],
        relatedInsights: []
      });
    }
    
    return insights;
  }

  getDataSources(): DataSource[] {
    return [...this.dataSources];
  }

  getPredictions(): WeatherPrediction[] {
    return [...this.predictions];
  }

  verifyPrediction(predictionId: string, actualValue: number): boolean {
    const prediction = this.predictions.find(p => p.id === predictionId);
    if (!prediction) return false;
    
    prediction.actualValue = actualValue;
    prediction.isVerified = true;
    
    // Calculate accuracy
    const error = Math.abs(prediction.predictedValue - actualValue);
    const range = Math.max(prediction.predictedValue, actualValue) - Math.min(prediction.predictedValue, actualValue);
    prediction.accuracy = Math.max(0, 100 - (error / range) * 100);
    
    return true;
  }
}

export const dataSourcesService = DataSourcesService.getInstance();
