import { UVIndex, AirQuality, PollenData, HealthAlert, SkinProtection, WeatherHealthTips } from '../types/health';
import { CurrentWeather } from '../types/weather';

export class HealthService {
  private static instance: HealthService;

  static getInstance(): HealthService {
    if (!HealthService.instance) {
      HealthService.instance = new HealthService();
    }
    return HealthService.instance;
  }

  calculateUVIndex(uvValue: number, skinType: number = 3): UVIndex {
    let category: UVIndex['category'];
    let description: string;
    let protectionTime: number;

    if (uvValue <= 2) {
      category = 'Low';
      description = 'Minimal sun protection required';
      protectionTime = 60;
    } else if (uvValue <= 5) {
      category = 'Moderate';
      description = 'Some protection required';
      protectionTime = 45;
    } else if (uvValue <= 7) {
      category = 'High';
      description = 'Protection required';
      protectionTime = 30;
    } else if (uvValue <= 10) {
      category = 'Very High';
      description = 'Extra protection required';
      protectionTime = 20;
    } else {
      category = 'Extreme';
      description = 'Avoid sun exposure';
      protectionTime = 10;
    }

    // Adjust protection time based on skin type
    const skinTypeMultiplier = [0.5, 0.7, 1.0, 1.3, 1.6, 2.0][skinType - 1];
    protectionTime = Math.round(protectionTime * skinTypeMultiplier);

    return {
      value: uvValue,
      category,
      description,
      protectionTime,
      skinType: `Type ${skinType}` as UVIndex['skinType']
    };
  }

  generateSkinProtection(uvIndex: UVIndex, weather: CurrentWeather): SkinProtection {
    let spf: number;
    let reapplyTime: number;
    const clothing: string[] = [];
    const accessories: string[] = [];

    if (uvIndex.value <= 3) {
      spf = 15;
      reapplyTime = 120;
    } else if (uvIndex.value <= 6) {
      spf = 30;
      reapplyTime = 90;
    } else if (uvIndex.value <= 8) {
      spf = 50;
      reapplyTime = 60;
    } else {
      spf = 50;
      reapplyTime = 45;
    }

    // Add clothing recommendations based on weather
    if (weather.main.temp < 15) {
      clothing.push('Long sleeves', 'Pants', 'Light jacket');
    } else if (weather.main.temp < 25) {
      clothing.push('T-shirt', 'Shorts or light pants');
    } else {
      clothing.push('Light, breathable clothing');
    }

    // Add accessories
    accessories.push('Sunglasses', 'Hat or cap');
    if (uvIndex.value > 6) {
      accessories.push('Sun umbrella');
    }

    // Calculate timing
    const currentHour = new Date().getHours();
    const avoidStart = Math.max(10, currentHour - 1);
    const avoidEnd = Math.min(16, currentHour + 1);
    const bestStart = Math.max(6, currentHour - 2);
    const bestEnd = Math.min(10, currentHour + 2);

    return {
      spf,
      reapplyTime,
      clothing,
      accessories,
      timing: {
        avoid: `${avoidStart}:00 - ${avoidEnd}:00`,
        best: `${bestStart}:00 - ${bestEnd}:00`
      }
    };
  }

  generateAirQualityRecommendations(aqi: number): AirQuality {
    let category: AirQuality['category'];
    const healthRecommendations: string[] = [];

    if (aqi <= 50) {
      category = 'Good';
      healthRecommendations.push('Air quality is satisfactory');
      healthRecommendations.push('No health concerns for the general population');
    } else if (aqi <= 100) {
      category = 'Moderate';
      healthRecommendations.push('Sensitive individuals may experience minor breathing discomfort');
      healthRecommendations.push('Consider reducing outdoor activities if you have respiratory issues');
    } else if (aqi <= 150) {
      category = 'Unhealthy for Sensitive Groups';
      healthRecommendations.push('Sensitive groups should avoid prolonged outdoor exertion');
      healthRecommendations.push('Consider wearing a mask if you have respiratory conditions');
    } else if (aqi <= 200) {
      category = 'Unhealthy';
      healthRecommendations.push('Everyone may begin to experience health effects');
      healthRecommendations.push('Avoid outdoor activities');
      healthRecommendations.push('Keep windows closed');
    } else if (aqi <= 300) {
      category = 'Very Unhealthy';
      healthRecommendations.push('Health warnings of emergency conditions');
      healthRecommendations.push('Stay indoors with air purifier if possible');
    } else {
      category = 'Hazardous';
      healthRecommendations.push('Health alert: everyone may experience serious health effects');
      healthRecommendations.push('Avoid all outdoor activities');
      healthRecommendations.push('Use air purifier and keep windows closed');
    }

    return {
      aqi,
      category,
      pollutants: {
        pm25: Math.round(aqi * 0.8),
        pm10: Math.round(aqi * 1.2),
        o3: Math.round(aqi * 0.6),
        no2: Math.round(aqi * 0.4),
        so2: Math.round(aqi * 0.3),
        co: Math.round(aqi * 0.1)
      },
      healthRecommendations
    };
  }

  generatePollenData(season: string, weather: CurrentWeather): PollenData {
    // Simulate pollen data based on season and weather
    let grass = 0;
    let tree = 0;
    let weed = 0;
    let mold = 0;

    const month = new Date().getMonth();
    const isSpring = month >= 2 && month <= 4;
    const isSummer = month >= 5 && month <= 7;
    const isFall = month >= 8 && month <= 10;

    if (isSpring) {
      tree = Math.floor(Math.random() * 8) + 2;
      grass = Math.floor(Math.random() * 4) + 1;
    } else if (isSummer) {
      grass = Math.floor(Math.random() * 9) + 3;
      weed = Math.floor(Math.random() * 6) + 2;
    } else if (isFall) {
      weed = Math.floor(Math.random() * 8) + 4;
      mold = Math.floor(Math.random() * 7) + 3;
    } else {
      mold = Math.floor(Math.random() * 5) + 2;
    }

    // Adjust based on weather
    if (weather.weather[0].main === 'Rain') {
      grass *= 0.3;
      tree *= 0.3;
      weed *= 0.3;
      mold *= 1.5; // Mold increases with moisture
    } else if (weather.wind.speed > 5) {
      grass *= 1.5;
      tree *= 1.5;
      weed *= 1.5;
    }

    const overall = Math.max(grass, tree, weed, mold);
    let category: PollenData['category'];
    const recommendations: string[] = [];

    if (overall <= 2) {
      category = 'Low';
      recommendations.push('Pollen levels are low');
    } else if (overall <= 4) {
      category = 'Moderate';
      recommendations.push('Sensitive individuals may experience symptoms');
      recommendations.push('Consider taking antihistamines if needed');
    } else if (overall <= 6) {
      category = 'High';
      recommendations.push('High pollen levels detected');
      recommendations.push('Keep windows closed');
      recommendations.push('Use air purifier');
      recommendations.push('Shower after outdoor activities');
    } else if (overall <= 8) {
      category = 'Very High';
      recommendations.push('Very high pollen levels');
      recommendations.push('Avoid outdoor activities if possible');
      recommendations.push('Wear a mask when outside');
    } else {
      category = 'Extreme';
      recommendations.push('Extreme pollen levels');
      recommendations.push('Stay indoors with air purifier');
      recommendations.push('Consider allergy medication');
    }

    return {
      grass: Math.round(grass),
      tree: Math.round(tree),
      weed: Math.round(weed),
      mold: Math.round(mold),
      overall: Math.round(overall),
      category,
      recommendations
    };
  }

  generateWeatherHealthTips(weather: CurrentWeather): WeatherHealthTips {
    const tips: WeatherHealthTips = {
      temperature: [],
      humidity: [],
      wind: [],
      precipitation: [],
      general: []
    };

    // Temperature tips
    if (weather.main.temp < 0) {
      tips.temperature.push('Dress in layers to stay warm');
      tips.temperature.push('Protect extremities from frostbite');
      tips.temperature.push('Stay hydrated - cold air is dry');
    } else if (weather.main.temp < 10) {
      tips.temperature.push('Wear warm clothing');
      tips.temperature.push('Consider a light jacket');
    } else if (weather.main.temp > 30) {
      tips.temperature.push('Stay hydrated - drink plenty of water');
      tips.temperature.push('Avoid prolonged sun exposure');
      tips.temperature.push('Wear light, breathable clothing');
    }

    // Humidity tips
    if (weather.main.humidity > 80) {
      tips.humidity.push('High humidity - stay cool and hydrated');
      tips.humidity.push('Use air conditioning if available');
    } else if (weather.main.humidity < 30) {
      tips.humidity.push('Low humidity - use moisturizer');
      tips.humidity.push('Consider using a humidifier');
    }

    // Wind tips
    if (weather.wind.speed > 10) {
      tips.wind.push('Strong winds - secure loose objects');
      tips.wind.push('Be cautious when driving');
    }

    // Precipitation tips
    if (weather.weather[0].main === 'Rain') {
      tips.precipitation.push('Carry an umbrella or raincoat');
      tips.precipitation.push('Be careful on wet surfaces');
    } else if (weather.weather[0].main === 'Snow') {
      tips.precipitation.push('Wear appropriate footwear for snow');
      tips.precipitation.push('Be cautious on icy surfaces');
    }

    // General tips
    tips.general.push('Check weather conditions before outdoor activities');
    tips.general.push('Dress appropriately for the weather');

    return tips;
  }

  generateHealthAlerts(weather: CurrentWeather, uvIndex: UVIndex, airQuality: AirQuality, pollenData: PollenData): HealthAlert[] {
    const alerts: HealthAlert[] = [];

    // UV alerts
    if (uvIndex.value > 8) {
      alerts.push({
        id: 'uv-extreme',
        type: 'uv',
        severity: 'extreme',
        title: 'Extreme UV Index',
        message: `UV index is ${uvIndex.value} - avoid sun exposure`,
        recommendations: ['Stay indoors', 'Use SPF 50+ sunscreen', 'Wear protective clothing'],
        validUntil: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        isActive: true
      });
    } else if (uvIndex.value > 6) {
      alerts.push({
        id: 'uv-high',
        type: 'uv',
        severity: 'high',
        title: 'High UV Index',
        message: `UV index is ${uvIndex.value} - protection required`,
        recommendations: ['Use sunscreen', 'Wear hat and sunglasses', 'Seek shade'],
        validUntil: new Date(Date.now() + 2 * 60 * 60 * 1000),
        isActive: true
      });
    }

    // Air quality alerts
    if (airQuality.aqi > 150) {
      alerts.push({
        id: 'air-unhealthy',
        type: 'air_quality',
        severity: 'high',
        title: 'Poor Air Quality',
        message: `Air quality is ${airQuality.category}`,
        recommendations: ['Avoid outdoor activities', 'Keep windows closed', 'Use air purifier'],
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        isActive: true
      });
    }

    // Pollen alerts
    if (pollenData.overall > 6) {
      alerts.push({
        id: 'pollen-high',
        type: 'pollen',
        severity: 'moderate',
        title: 'High Pollen Count',
        message: `Pollen levels are ${pollenData.category}`,
        recommendations: ['Keep windows closed', 'Use air purifier', 'Consider allergy medication'],
        validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
        isActive: true
      });
    }

    // Temperature alerts
    if (weather.main.temp < -10) {
      alerts.push({
        id: 'temp-extreme-cold',
        type: 'temperature',
        severity: 'extreme',
        title: 'Extreme Cold',
        message: 'Dangerously cold temperatures',
        recommendations: ['Stay indoors', 'Dress in layers', 'Avoid prolonged exposure'],
        validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
        isActive: true
      });
    } else if (weather.main.temp > 35) {
      alerts.push({
        id: 'temp-extreme-hot',
        type: 'temperature',
        severity: 'extreme',
        title: 'Extreme Heat',
        message: 'Dangerously hot temperatures',
        recommendations: ['Stay indoors', 'Stay hydrated', 'Use air conditioning'],
        validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000),
        isActive: true
      });
    }

    return alerts;
  }
}

export const healthService = HealthService.getInstance();
