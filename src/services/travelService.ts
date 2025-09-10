import { 
  TravelDestination, 
  TravelPlan, 
  PackingItem, 
  MultiCityWeather, 
  FlightWeatherImpact, 
  TravelRecommendation 
} from '../types/travel';
import { CurrentWeather, WeatherForecast } from '../types/weather';

export class TravelService {
  private static instance: TravelService;
  private destinations: TravelDestination[] = [];

  constructor() {
    this.initializeDestinations();
  }

  static getInstance(): TravelService {
    if (!TravelService.instance) {
      TravelService.instance = new TravelService();
    }
    return TravelService.instance;
  }

  private initializeDestinations() {
    this.destinations = [
      {
        id: 'paris',
        name: 'Paris',
        country: 'France',
        coordinates: { latitude: 48.8566, longitude: 2.3522 },
        timezone: 'Europe/Paris',
        bestTimeToVisit: {
          start: 'April',
          end: 'October',
          reason: 'Mild temperatures and less rainfall'
        },
        weatherPatterns: {
          summer: {
            averageTemp: 20,
            minTemp: 15,
            maxTemp: 25,
            precipitation: 50,
            humidity: 70,
            conditions: ['Clear', 'Partly Cloudy'],
            description: 'Warm and pleasant with occasional rain'
          },
          winter: {
            averageTemp: 5,
            minTemp: 0,
            maxTemp: 10,
            precipitation: 60,
            humidity: 80,
            conditions: ['Cloudy', 'Rain'],
            description: 'Cold and damp with frequent rain'
          },
          spring: {
            averageTemp: 12,
            minTemp: 7,
            maxTemp: 17,
            precipitation: 45,
            humidity: 75,
            conditions: ['Clear', 'Partly Cloudy', 'Rain'],
            description: 'Mild with increasing sunshine'
          },
          fall: {
            averageTemp: 13,
            minTemp: 8,
            maxTemp: 18,
            precipitation: 55,
            humidity: 78,
            conditions: ['Clear', 'Cloudy', 'Rain'],
            description: 'Cooling down with more rain'
          }
        },
        attractions: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Champs-Élysées'],
        packingRecommendations: ['Comfortable walking shoes', 'Light jacket', 'Umbrella', 'Camera']
      },
      {
        id: 'tokyo',
        name: 'Tokyo',
        country: 'Japan',
        coordinates: { latitude: 35.6762, longitude: 139.6503 },
        timezone: 'Asia/Tokyo',
        bestTimeToVisit: {
          start: 'March',
          end: 'May',
          reason: 'Cherry blossom season and mild weather'
        },
        weatherPatterns: {
          summer: {
            averageTemp: 26,
            minTemp: 22,
            maxTemp: 30,
            precipitation: 150,
            humidity: 80,
            conditions: ['Clear', 'Partly Cloudy', 'Rain'],
            description: 'Hot and humid with frequent rain'
          },
          winter: {
            averageTemp: 8,
            minTemp: 3,
            maxTemp: 13,
            precipitation: 40,
            humidity: 60,
            conditions: ['Clear', 'Cloudy'],
            description: 'Cool and dry with occasional snow'
          },
          spring: {
            averageTemp: 16,
            minTemp: 11,
            maxTemp: 21,
            precipitation: 80,
            humidity: 70,
            conditions: ['Clear', 'Partly Cloudy', 'Rain'],
            description: 'Mild with cherry blossoms'
          },
          fall: {
            averageTemp: 18,
            minTemp: 13,
            maxTemp: 23,
            precipitation: 90,
            humidity: 75,
            conditions: ['Clear', 'Partly Cloudy', 'Rain'],
            description: 'Pleasant with autumn colors'
          }
        },
        attractions: ['Tokyo Skytree', 'Senso-ji Temple', 'Shibuya Crossing', 'Tsukiji Fish Market'],
        packingRecommendations: ['Lightweight clothing', 'Rain gear', 'Comfortable shoes', 'Portable fan']
      },
      {
        id: 'sydney',
        name: 'Sydney',
        country: 'Australia',
        coordinates: { latitude: -33.8688, longitude: 151.2093 },
        timezone: 'Australia/Sydney',
        bestTimeToVisit: {
          start: 'September',
          end: 'November',
          reason: 'Spring weather with mild temperatures'
        },
        weatherPatterns: {
          summer: {
            averageTemp: 23,
            minTemp: 18,
            maxTemp: 28,
            precipitation: 100,
            humidity: 65,
            conditions: ['Clear', 'Partly Cloudy'],
            description: 'Warm and sunny with occasional storms'
          },
          winter: {
            averageTemp: 13,
            minTemp: 8,
            maxTemp: 18,
            precipitation: 80,
            humidity: 70,
            conditions: ['Clear', 'Cloudy', 'Rain'],
            description: 'Mild winter with some rain'
          },
          spring: {
            averageTemp: 18,
            minTemp: 13,
            maxTemp: 23,
            precipitation: 70,
            humidity: 68,
            conditions: ['Clear', 'Partly Cloudy'],
            description: 'Pleasant with increasing warmth'
          },
          fall: {
            averageTemp: 20,
            minTemp: 15,
            maxTemp: 25,
            precipitation: 90,
            humidity: 72,
            conditions: ['Clear', 'Partly Cloudy', 'Rain'],
            description: 'Mild with more rainfall'
          }
        },
        attractions: ['Sydney Opera House', 'Harbour Bridge', 'Bondi Beach', 'Royal Botanic Gardens'],
        packingRecommendations: ['Sunscreen', 'Swimwear', 'Light layers', 'Sunglasses']
      }
    ];
  }

  generateTravelPlan(
    destinationId: string,
    startDate: Date,
    endDate: Date,
    weatherForecast: WeatherForecast
  ): TravelPlan | null {
    const destination = this.destinations.find(d => d.id === destinationId);
    if (!destination) return null;

    const forecast = weatherForecast.list.slice(0, 5).map(item => ({
      date: new Date(item.dt * 1000),
      temperature: item.main.temp,
      condition: item.weather[0].main,
      precipitation: item.pop * 100,
      windSpeed: item.wind.speed,
      humidity: item.main.humidity
    }));

    const recommendations = this.generateRecommendations(destination, forecast);
    const packingList = this.generatePackingList(destination, forecast, startDate, endDate);

    return {
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      destination,
      startDate,
      endDate,
      weatherForecast: forecast,
      recommendations,
      packingList
    };
  }

  private generateRecommendations(destination: TravelDestination, forecast: any[]) {
    const avgTemp = forecast.reduce((sum, day) => sum + day.temperature, 0) / forecast.length;
    const hasRain = forecast.some(day => day.condition === 'Rain' || day.precipitation > 50);
    const hasWind = forecast.some(day => day.windSpeed > 10);

    const clothing: string[] = [];
    const activities: string[] = [];
    const precautions: string[] = [];

    // Clothing recommendations
    if (avgTemp < 10) {
      clothing.push('Warm coat', 'Thermal layers', 'Gloves', 'Hat');
    } else if (avgTemp < 20) {
      clothing.push('Light jacket', 'Long sleeves', 'Comfortable pants');
    } else {
      clothing.push('Light clothing', 'Shorts', 'T-shirts', 'Sunglasses');
    }

    if (hasRain) {
      clothing.push('Waterproof jacket', 'Umbrella', 'Waterproof shoes');
    }

    if (hasWind) {
      clothing.push('Windbreaker', 'Hat with chin strap');
    }

    // Activity recommendations
    if (avgTemp > 20 && !hasRain) {
      activities.push('Outdoor sightseeing', 'Beach activities', 'Walking tours');
    } else if (avgTemp > 10 && !hasRain) {
      activities.push('City walking', 'Museum visits', 'Outdoor dining');
    } else {
      activities.push('Indoor attractions', 'Museums', 'Shopping', 'Indoor dining');
    }

    // Precautions
    if (hasRain) {
      precautions.push('Carry umbrella', 'Check for indoor alternatives', 'Wear waterproof shoes');
    }

    if (hasWind) {
      precautions.push('Secure loose items', 'Be careful near water', 'Hold onto hats and umbrellas');
    }

    if (avgTemp > 25) {
      precautions.push('Stay hydrated', 'Use sunscreen', 'Seek shade during peak hours');
    }

    if (avgTemp < 5) {
      precautions.push('Dress warmly', 'Avoid prolonged outdoor exposure', 'Check for ice on paths');
    }

    return { clothing, activities, precautions };
  }

  private generatePackingList(
    destination: TravelDestination, 
    forecast: any[], 
    startDate: Date, 
    endDate: Date
  ): PackingItem[] {
    const items: PackingItem[] = [];
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const avgTemp = forecast.reduce((sum, day) => sum + day.temperature, 0) / forecast.length;
    const hasRain = forecast.some(day => day.condition === 'Rain' || day.precipitation > 50);

    // Essential clothing
    if (avgTemp < 10) {
      items.push({
        category: 'clothing',
        item: 'Warm coat',
        quantity: 1,
        priority: 'essential',
        reason: 'Cold weather protection'
      });
      items.push({
        category: 'clothing',
        item: 'Thermal base layers',
        quantity: Math.ceil(duration / 2),
        priority: 'essential',
        reason: 'Insulation for cold weather'
      });
    } else if (avgTemp < 20) {
      items.push({
        category: 'clothing',
        item: 'Light jacket',
        quantity: 1,
        priority: 'essential',
        reason: 'Cool weather protection'
      });
    } else {
      items.push({
        category: 'clothing',
        item: 'Light t-shirts',
        quantity: Math.ceil(duration / 2),
        priority: 'essential',
        reason: 'Comfortable for warm weather'
      });
    }

    // Rain protection
    if (hasRain) {
      items.push({
        category: 'accessories',
        item: 'Umbrella',
        quantity: 1,
        priority: 'essential',
        reason: 'Rain protection'
      });
      items.push({
        category: 'clothing',
        item: 'Waterproof jacket',
        quantity: 1,
        priority: 'essential',
        reason: 'Waterproof outer layer'
      });
    }

    // Footwear
    items.push({
      category: 'accessories',
      item: 'Comfortable walking shoes',
      quantity: 1,
      priority: 'essential',
      reason: 'Essential for sightseeing'
    });

    if (hasRain) {
      items.push({
        category: 'accessories',
        item: 'Waterproof shoes',
        quantity: 1,
        priority: 'recommended',
        reason: 'Keep feet dry in wet weather'
      });
    }

    // Electronics
    items.push({
      category: 'electronics',
      item: 'Camera',
      quantity: 1,
      priority: 'recommended',
      reason: 'Capture memories'
    });
    items.push({
      category: 'electronics',
      item: 'Phone charger',
      quantity: 1,
      priority: 'essential',
      reason: 'Keep devices powered'
    });

    // Documents
    items.push({
      category: 'documents',
      item: 'Passport',
      quantity: 1,
      priority: 'essential',
      reason: 'Required for international travel'
    });
    items.push({
      category: 'documents',
      item: 'Travel insurance',
      quantity: 1,
      priority: 'recommended',
      reason: 'Protection against unexpected events'
    });

    return items;
  }

  getMultiCityWeather(cities: { name: string; country: string; coordinates: { latitude: number; longitude: number } }[]): MultiCityWeather {
    // In a real app, this would fetch actual weather data for each city
    const cityWeather = cities.map(city => ({
      name: city.name,
      country: city.country,
      coordinates: city.coordinates,
      currentWeather: {
        temperature: Math.round(Math.random() * 30 + 5), // Simulated data
        condition: ['Clear', 'Cloudy', 'Rain', 'Snow'][Math.floor(Math.random() * 4)],
        humidity: Math.round(Math.random() * 40 + 40),
        windSpeed: Math.round(Math.random() * 15 + 5)
      },
      forecast: Array.from({ length: 5 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        temperature: Math.round(Math.random() * 30 + 5),
        condition: ['Clear', 'Cloudy', 'Rain', 'Snow'][Math.floor(Math.random() * 4)]
      }))
    }));

    return {
      cities: cityWeather,
      lastUpdated: new Date()
    };
  }

  analyzeFlightWeatherImpact(flightId: string, departure: any, arrival: any): FlightWeatherImpact {
    const departureWeather = departure.weather;
    const arrivalWeather = arrival.weather;

    const departureDelayRisk = this.calculateDelayRisk(departureWeather);
    const arrivalDelayRisk = this.calculateDelayRisk(arrivalWeather);
    const overallDelayRisk = departureDelayRisk === 'high' || arrivalDelayRisk === 'high' ? 'high' : 
                           departureDelayRisk === 'medium' || arrivalDelayRisk === 'medium' ? 'medium' : 'low';

    const recommendations = this.generateFlightRecommendations(departureWeather, arrivalWeather);

    return {
      flightId,
      departure: {
        airport: departure.airport,
        city: departure.city,
        weather: departureWeather,
        delayRisk: departureDelayRisk,
        delayReason: this.getDelayReason(departureWeather)
      },
      arrival: {
        airport: arrival.airport,
        city: arrival.city,
        weather: arrivalWeather,
        delayRisk: arrivalDelayRisk,
        delayReason: this.getDelayReason(arrivalWeather)
      },
      overallDelayRisk,
      recommendations
    };
  }

  private calculateDelayRisk(weather: any): 'low' | 'medium' | 'high' {
    let risk: 'low' | 'medium' | 'high' = 'low';

    if (weather.condition === 'Rain' && weather.precipitation > 50) risk = 'medium';
    if (weather.condition === 'Snow') risk = 'high';
    if (weather.windSpeed > 15) risk = 'high';
    if (weather.visibility < 1000) risk = 'high';
    if (weather.temperature < -10 || weather.temperature > 40) risk = 'medium';

    return risk;
  }

  private getDelayReason(weather: any): string | undefined {
    if (weather.condition === 'Snow') return 'Snow conditions';
    if (weather.windSpeed > 15) return 'High winds';
    if (weather.visibility < 1000) return 'Low visibility';
    if (weather.condition === 'Rain' && weather.precipitation > 50) return 'Heavy rain';
    return undefined;
  }

  private generateFlightRecommendations(departureWeather: any, arrivalWeather: any): string[] {
    const recommendations: string[] = [];

    if (departureWeather.condition === 'Rain' || arrivalWeather.condition === 'Rain') {
      recommendations.push('Pack rain gear in carry-on');
    }

    if (departureWeather.temperature < 10 || arrivalWeather.temperature < 10) {
      recommendations.push('Dress warmly for cold weather');
    }

    if (departureWeather.windSpeed > 10 || arrivalWeather.windSpeed > 10) {
      recommendations.push('Secure loose items, expect turbulence');
    }

    if (departureWeather.visibility < 2000 || arrivalWeather.visibility < 2000) {
      recommendations.push('Allow extra time for airport navigation');
    }

    return recommendations;
  }

  getTravelRecommendations(userPreferences: any): TravelRecommendation[] {
    return this.destinations.map(dest => {
      const currentMonth = new Date().getMonth();
      const season = this.getSeason(currentMonth);
      const weatherPattern = dest.weatherPatterns[season];
      
      const weatherScore = this.calculateWeatherScore(weatherPattern);
      const activities = this.getRecommendedActivities(dest, weatherPattern);
      const packingTips = this.getPackingTips(dest, weatherPattern);
      const weatherAlerts = this.getWeatherAlerts(weatherPattern);

      return {
        destination: `${dest.name}, ${dest.country}`,
        reason: dest.bestTimeToVisit.reason,
        weatherScore,
        bestTime: `${dest.bestTimeToVisit.start} - ${dest.bestTimeToVisit.end}`,
        activities,
        packingTips,
        weatherAlerts
      };
    });
  }

  private getSeason(month: number): 'summer' | 'winter' | 'spring' | 'fall' {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  private calculateWeatherScore(weatherPattern: any): number {
    let score = 50; // Base score

    // Temperature scoring
    if (weatherPattern.averageTemp >= 15 && weatherPattern.averageTemp <= 25) score += 20;
    else if (weatherPattern.averageTemp >= 10 && weatherPattern.averageTemp <= 30) score += 10;

    // Precipitation scoring
    if (weatherPattern.precipitation < 50) score += 15;
    else if (weatherPattern.precipitation < 80) score += 5;

    // Humidity scoring
    if (weatherPattern.humidity >= 40 && weatherPattern.humidity <= 70) score += 10;

    return Math.min(100, score);
  }

  private getRecommendedActivities(dest: TravelDestination, weatherPattern: any): string[] {
    const activities = [...dest.attractions];
    
    if (weatherPattern.averageTemp > 20) {
      activities.push('Outdoor dining', 'Walking tours', 'Beach activities');
    } else if (weatherPattern.averageTemp > 10) {
      activities.push('City walking', 'Outdoor markets', 'Park visits');
    } else {
      activities.push('Museum visits', 'Indoor attractions', 'Shopping');
    }

    return activities.slice(0, 5);
  }

  private getPackingTips(dest: TravelDestination, weatherPattern: any): string[] {
    const tips = [...dest.packingRecommendations];

    if (weatherPattern.precipitation > 60) {
      tips.push('Waterproof clothing', 'Umbrella');
    }

    if (weatherPattern.averageTemp > 25) {
      tips.push('Sunscreen', 'Lightweight clothing', 'Hat');
    }

    if (weatherPattern.averageTemp < 10) {
      tips.push('Warm layers', 'Gloves', 'Thermal clothing');
    }

    return tips.slice(0, 5);
  }

  private getWeatherAlerts(weatherPattern: any): string[] {
    const alerts: string[] = [];

    if (weatherPattern.precipitation > 80) {
      alerts.push('High chance of rain - pack rain gear');
    }

    if (weatherPattern.averageTemp > 30) {
      alerts.push('Hot weather - stay hydrated and use sunscreen');
    }

    if (weatherPattern.averageTemp < 5) {
      alerts.push('Cold weather - dress warmly');
    }

    if (weatherPattern.humidity > 80) {
      alerts.push('High humidity - expect muggy conditions');
    }

    return alerts;
  }

  getDestinations(): TravelDestination[] {
    return [...this.destinations];
  }
}

export const travelService = TravelService.getInstance();
