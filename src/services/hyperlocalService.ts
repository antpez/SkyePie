import { 
  MicroWeatherReport, 
  TrafficWeatherImpact, 
  NeighborhoodWeather, 
  CrowdsourcedData, 
  MicroClimateDetection, 
  HyperlocalSettings 
} from '../types/hyperlocal';
import { CurrentWeather } from '../types/weather';

export class HyperlocalService {
  private static instance: HyperlocalService;
  private reports: MicroWeatherReport[] = [];
  private neighborhoods: NeighborhoodWeather[] = [];
  private crowdsourcedData: CrowdsourcedData[] = [];
  private settings: HyperlocalSettings;

  constructor() {
    this.settings = {
      dataCollection: {
        enabled: true,
        autoReport: false,
        reportInterval: 15,
        accuracyThreshold: 100
      },
      crowdsourcing: {
        enabled: true,
        verificationRequired: true,
        peerReview: true,
        expertReview: false
      },
      privacy: {
        locationSharing: true,
        dataSharing: true,
        anonymization: true,
        retentionPeriod: 30
      },
      notifications: {
        microWeatherAlerts: true,
        trafficImpacts: true,
        neighborhoodUpdates: true,
        verificationRequests: true
      }
    };
  }

  static getInstance(): HyperlocalService {
    if (!HyperlocalService.instance) {
      HyperlocalService.instance = new HyperlocalService();
    }
    return HyperlocalService.instance;
  }

  submitMicroWeatherReport(
    userId: string,
    location: { latitude: number; longitude: number; accuracy: number },
    weather: MicroWeatherReport['weather'],
    conditions: MicroWeatherReport['conditions'],
    photos?: string[],
    notes?: string
  ): MicroWeatherReport {
    const report: MicroWeatherReport = {
      id: `micro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      location,
      timestamp: new Date(),
      weather,
      conditions,
      quality: {
        confidence: this.calculateConfidence(weather, conditions),
        verification: 'pending',
        source: 'user_report'
      },
      photos,
      notes
    };

    this.reports.push(report);
    this.updateNeighborhoodData(report);
    this.createCrowdsourcedData(report);

    return report;
  }

  private calculateConfidence(weather: MicroWeatherReport['weather'], conditions: MicroWeatherReport['conditions']): number {
    let confidence = 50; // Base confidence

    // Temperature confidence
    if (weather.temperature >= -50 && weather.temperature <= 60) {
      confidence += 20;
    }

    // Humidity confidence
    if (weather.humidity >= 0 && weather.humidity <= 100) {
      confidence += 15;
    }

    // Pressure confidence
    if (weather.pressure >= 800 && weather.pressure <= 1100) {
      confidence += 15;
    }

    // Wind speed confidence
    if (weather.windSpeed >= 0 && weather.windSpeed <= 100) {
      confidence += 10;
    }

    // UV index confidence
    if (weather.uvIndex >= 0 && weather.uvIndex <= 15) {
      confidence += 10;
    }

    // Conditions consistency
    if (conditions.precipitation === 'none' && conditions.sky === 'clear') {
      confidence += 10;
    } else if (conditions.precipitation !== 'none' && conditions.sky !== 'clear') {
      confidence += 10;
    }

    return Math.min(100, confidence);
  }

  private updateNeighborhoodData(report: MicroWeatherReport) {
    const neighborhood = this.findOrCreateNeighborhood(report.location);
    
    // Add report to neighborhood
    neighborhood.reports.push(report);
    
    // Update aggregated data
    this.updateAggregatedData(neighborhood);
    
    // Detect micro-climate
    this.detectMicroClimate(neighborhood);
  }

  private findOrCreateNeighborhood(location: { latitude: number; longitude: number }): NeighborhoodWeather {
    const radius = 500; // 500 meters
    
    // Find existing neighborhood
    let neighborhood = this.neighborhoods.find(n => 
      this.calculateDistance(
        location.latitude, location.longitude,
        n.center.latitude, n.center.longitude
      ) <= radius
    );
    
    if (!neighborhood) {
      // Create new neighborhood
      neighborhood = {
        id: `neighborhood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `Neighborhood ${this.neighborhoods.length + 1}`,
        center: location,
        radius,
        reports: [],
        aggregated: {
          temperature: { average: 0, min: 0, max: 0, standardDeviation: 0 },
          humidity: { average: 0, min: 0, max: 0 },
          precipitation: { total: 0, intensity: 'light', duration: 0 },
          wind: { averageSpeed: 0, maxSpeed: 0, dominantDirection: 0 }
        },
        confidence: 0,
        lastUpdated: new Date(),
        microClimate: {
          type: 'normal',
          description: 'Standard weather patterns',
          intensity: 'low'
        }
      };
      
      this.neighborhoods.push(neighborhood);
    }
    
    return neighborhood;
  }

  private updateAggregatedData(neighborhood: NeighborhoodWeather) {
    const reports = neighborhood.reports;
    if (reports.length === 0) return;
    
    // Temperature aggregation
    const temperatures = reports.map(r => r.weather.temperature);
    neighborhood.aggregated.temperature = {
      average: temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length,
      min: Math.min(...temperatures),
      max: Math.max(...temperatures),
      standardDeviation: this.calculateStandardDeviation(temperatures)
    };
    
    // Humidity aggregation
    const humidities = reports.map(r => r.weather.humidity);
    neighborhood.aggregated.humidity = {
      average: humidities.reduce((sum, hum) => sum + hum, 0) / humidities.length,
      min: Math.min(...humidities),
      max: Math.max(...humidities)
    };
    
    // Precipitation aggregation
    const precipReports = reports.filter(r => r.conditions.precipitation !== 'none');
    neighborhood.aggregated.precipitation = {
      total: precipReports.length > 0 ? precipReports.reduce((sum, r) => sum + (r.weather.pressure * 0.1), 0) : 0,
      intensity: this.calculatePrecipitationIntensity(precipReports),
      duration: precipReports.length * 15 // 15 minutes per report
    };
    
    // Wind aggregation
    const windSpeeds = reports.map(r => r.weather.windSpeed);
    const windDirections = reports.map(r => r.weather.windDirection);
    neighborhood.aggregated.wind = {
      averageSpeed: windSpeeds.reduce((sum, speed) => sum + speed, 0) / windSpeeds.length,
      maxSpeed: Math.max(...windSpeeds),
      dominantDirection: this.calculateDominantDirection(windDirections)
    };
    
    // Update confidence
    neighborhood.confidence = this.calculateNeighborhoodConfidence(neighborhood);
    neighborhood.lastUpdated = new Date();
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  private calculatePrecipitationIntensity(reports: MicroWeatherReport[]): 'light' | 'moderate' | 'heavy' {
    if (reports.length === 0) return 'light';
    
    const avgIntensity = reports.reduce((sum, r) => {
      switch (r.conditions.precipitation) {
        case 'light': return sum + 1;
        case 'moderate': return sum + 2;
        case 'heavy': return sum + 3;
        default: return sum;
      }
    }, 0) / reports.length;
    
    if (avgIntensity < 1.5) return 'light';
    if (avgIntensity < 2.5) return 'moderate';
    return 'heavy';
  }

  private calculateDominantDirection(directions: number[]): number {
    if (directions.length === 0) return 0;
    
    // Convert to radians and calculate average
    const radians = directions.map(dir => dir * Math.PI / 180);
    const avgX = radians.map(rad => Math.cos(rad)).reduce((sum, x) => sum + x, 0) / radians.length;
    const avgY = radians.map(rad => Math.sin(rad)).reduce((sum, y) => sum + y, 0) / radians.length;
    
    return Math.atan2(avgY, avgX) * 180 / Math.PI;
  }

  private calculateNeighborhoodConfidence(neighborhood: NeighborhoodWeather): number {
    const reportCount = neighborhood.reports.length;
    const timeSpan = Date.now() - neighborhood.reports[0]?.timestamp.getTime() || 0;
    const hours = timeSpan / (1000 * 60 * 60);
    
    let confidence = 0;
    
    // More reports = higher confidence
    confidence += Math.min(40, reportCount * 5);
    
    // Recent reports = higher confidence
    if (hours < 1) confidence += 30;
    else if (hours < 6) confidence += 20;
    else if (hours < 24) confidence += 10;
    
    // Consistent data = higher confidence
    const tempStdDev = neighborhood.aggregated.temperature.standardDeviation;
    if (tempStdDev < 2) confidence += 20;
    else if (tempStdDev < 5) confidence += 10;
    
    return Math.min(100, confidence);
  }

  private detectMicroClimate(neighborhood: NeighborhoodWeather) {
    const temp = neighborhood.aggregated.temperature.average;
    const humidity = neighborhood.aggregated.humidity.average;
    const windSpeed = neighborhood.aggregated.wind.averageSpeed;
    const reports = neighborhood.reports;
    
    if (reports.length < 3) return; // Need at least 3 reports
    
    // Compare with surrounding areas (simplified)
    const surroundingTemp = temp - 2; // Assume surrounding is 2°C cooler
    const tempDifference = temp - surroundingTemp;
    
    let microClimateType: MicroClimateDetection['type'] = 'normal' as MicroClimateDetection['type'];
    let intensity: MicroClimateDetection['intensity'] = 'low';
    let description = 'Standard weather patterns';
    
    if (tempDifference > 3) {
      microClimateType = 'urban_heat_island';
      intensity = tempDifference > 5 ? 'high' : 'medium';
      description = 'Urban heat island effect detected';
    } else if (tempDifference < -2) {
      microClimateType = 'valley_cooling';
      intensity = tempDifference < -4 ? 'high' : 'medium';
      description = 'Valley cooling effect detected';
    } else if (windSpeed > 10 && humidity > 70) {
      microClimateType = 'coastal_breeze';
      intensity = windSpeed > 15 ? 'high' : 'medium';
      description = 'Coastal breeze effect detected';
    }
    
    neighborhood.microClimate = {
      type: microClimateType,
      description,
      intensity
    };
  }

  private createCrowdsourcedData(report: MicroWeatherReport) {
    const crowdsourcedData: CrowdsourcedData = {
      id: `crowd_${report.id}`,
      type: 'weather_report',
      userId: report.userId,
      location: report.location,
      timestamp: report.timestamp,
      data: {
        weather: report.weather,
        conditions: report.conditions,
        photos: report.photos,
        notes: report.notes
      },
      verification: {
        status: 'pending',
        verifiedBy: [],
        confidence: report.quality.confidence,
        method: 'automatic'
      },
      quality: {
        score: report.quality.confidence,
        factors: {
          accuracy: report.quality.confidence,
          completeness: this.calculateCompleteness(report),
          timeliness: this.calculateTimeliness(report),
          reliability: this.calculateReliability(report)
        }
      }
    };
    
    this.crowdsourcedData.push(crowdsourcedData);
  }

  private calculateCompleteness(report: MicroWeatherReport): number {
    let completeness = 0;
    
    if (report.weather.temperature !== undefined) completeness += 20;
    if (report.weather.humidity !== undefined) completeness += 20;
    if (report.weather.pressure !== undefined) completeness += 20;
    if (report.weather.windSpeed !== undefined) completeness += 20;
    if (report.conditions.sky !== undefined) completeness += 10;
    if (report.conditions.precipitation !== undefined) completeness += 10;
    
    return completeness;
  }

  private calculateTimeliness(report: MicroWeatherReport): number {
    const age = Date.now() - report.timestamp.getTime();
    const minutes = age / (1000 * 60);
    
    if (minutes < 5) return 100;
    if (minutes < 15) return 80;
    if (minutes < 30) return 60;
    if (minutes < 60) return 40;
    return 20;
  }

  private calculateReliability(report: MicroWeatherReport): number {
    let reliability = 50;
    
    // Higher accuracy location = more reliable
    if (report.location.accuracy < 10) reliability += 20;
    else if (report.location.accuracy < 50) reliability += 10;
    
    // Photos increase reliability
    if (report.photos && report.photos.length > 0) reliability += 15;
    
    // Notes increase reliability
    if (report.notes && report.notes.length > 10) reliability += 15;
    
    return Math.min(100, reliability);
  }

  analyzeTrafficWeatherImpact(
    location: string,
    weather: CurrentWeather,
    trafficData: { speed: number; density: 'low' | 'medium' | 'high' | 'severe'; delay: number; incidents: number }
  ): TrafficWeatherImpact {
    const condition = weather.weather[0].main;
    const temperature = weather.main.temp;
    const precipitation = weather.weather[0].main === 'Rain' ? 50 : 0;
    const visibility = weather.visibility || 10;
    const windSpeed = weather.wind.speed;
    
    let severity: TrafficWeatherImpact['impact']['severity'] = 'low';
    let description = '';
    const recommendations: string[] = [];
    
    // Analyze impact based on weather and traffic
    if (condition === 'Rain' && trafficData.density === 'high') {
      severity = 'high';
      description = 'Heavy rain causing significant traffic delays';
      recommendations.push('Allow extra travel time', 'Use alternative routes', 'Drive with extra caution');
    } else if (condition === 'Snow' && trafficData.delay > 30) {
      severity = 'extreme';
      description = 'Snow causing extreme traffic delays';
      recommendations.push('Avoid unnecessary travel', 'Use public transportation', 'Check road conditions');
    } else if (visibility < 5 && trafficData.speed < 30) {
      severity = 'high';
      description = 'Low visibility causing slow traffic';
      recommendations.push('Reduce speed', 'Increase following distance', 'Use headlights');
    } else if (windSpeed > 20 && trafficData.incidents > 5) {
      severity = 'medium';
      description = 'Strong winds causing traffic incidents';
      recommendations.push('Avoid high-profile vehicles', 'Secure loose cargo', 'Drive defensively');
    } else {
      description = 'Weather conditions having minimal impact on traffic';
    }
    
    // Calculate correlation factors
    const weatherFactor = this.calculateWeatherFactor(condition, temperature, precipitation, visibility, windSpeed);
    const trafficFactor = this.calculateTrafficFactor(trafficData);
    const combinedImpact = (weatherFactor + trafficFactor) / 2;
    
    return {
      id: `traffic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      location,
      timestamp: new Date(),
      weather: { condition, temperature, precipitation, visibility, windSpeed },
      traffic: trafficData,
      impact: { severity, description, recommendations },
      correlation: { weatherFactor, trafficFactor, combinedImpact }
    };
  }

  private calculateWeatherFactor(condition: string, temp: number, precip: number, visibility: number, windSpeed: number): number {
    let factor = 0;
    
    if (condition === 'Rain') factor += 0.3;
    if (condition === 'Snow') factor += 0.5;
    if (condition === 'Fog') factor += 0.4;
    if (temp < 0 || temp > 35) factor += 0.2;
    if (precip > 20) factor += 0.3;
    if (visibility < 5) factor += 0.4;
    if (windSpeed > 15) factor += 0.2;
    
    return Math.min(1, factor);
  }

  private calculateTrafficFactor(traffic: { speed: number; density: string; delay: number; incidents: number }): number {
    let factor = 0;
    
    if (traffic.speed < 20) factor += 0.3;
    if (traffic.density === 'high') factor += 0.2;
    if (traffic.density === 'severe') factor += 0.4;
    if (traffic.delay > 30) factor += 0.3;
    if (traffic.incidents > 5) factor += 0.2;
    
    return Math.min(1, factor);
  }

  getNeighborhoodWeather(latitude: number, longitude: number, radius: number = 500): NeighborhoodWeather | null {
    return this.neighborhoods.find(n => 
      this.calculateDistance(latitude, longitude, n.center.latitude, n.center.longitude) <= radius
    ) || null;
  }

  getNearbyReports(latitude: number, longitude: number, radius: number = 1000): MicroWeatherReport[] {
    return this.reports.filter(r => 
      this.calculateDistance(latitude, longitude, r.location.latitude, r.location.longitude) <= radius
    );
  }

  getCrowdsourcedData(type?: string): CrowdsourcedData[] {
    if (type) {
      return this.crowdsourcedData.filter(d => d.type === type);
    }
    return [...this.crowdsourcedData];
  }

  verifyCrowdsourcedData(dataId: string, verifiedBy: string, method: 'automatic' | 'peer_review' | 'expert_review'): boolean {
    const data = this.crowdsourcedData.find(d => d.id === dataId);
    if (!data) return false;
    
    data.verification.verifiedBy.push(verifiedBy);
    data.verification.method = method;
    
    if (data.verification.verifiedBy.length >= 3) {
      data.verification.status = 'verified';
      data.verification.confidence = Math.min(100, data.verification.confidence + 20);
    }
    
    return true;
  }

  getHyperlocalSettings(): HyperlocalSettings {
    return { ...this.settings };
  }

  updateHyperlocalSettings(settings: Partial<HyperlocalSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Convert to meters
  }
}

export const hyperlocalService = HyperlocalService.getInstance();
