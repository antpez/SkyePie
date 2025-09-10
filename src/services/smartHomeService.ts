import { 
  SmartDevice, 
  ThermostatControl, 
  GardenCareAlert, 
  OutdoorEquipmentAlert, 
  EnergyOptimization, 
  SmartHomeScene, 
  IoTIntegration, 
  SmartHomeSettings 
} from '../types/smartHome';
import { CurrentWeather, WeatherForecast } from '../types/weather';

export class SmartHomeService {
  private static instance: SmartHomeService;
  private devices: SmartDevice[] = [];
  private settings: SmartHomeSettings;
  private integrations: IoTIntegration[] = [];

  constructor() {
    this.settings = {
      weatherIntegration: {
        enabled: false,
        updateInterval: 15,
        temperatureThreshold: 5,
        humidityThreshold: 20,
        windThreshold: 10
      },
      automation: {
        enabled: false,
        scenes: [],
        schedules: []
      },
      notifications: {
        enabled: false,
        gardenAlerts: true,
        equipmentAlerts: true,
        energyAlerts: true,
        weatherAlerts: true
      },
      privacy: {
        dataSharing: false,
        locationSharing: false,
        deviceControl: false
      }
    };

    this.initializeDevices();
    this.initializeIntegrations();
  }

  static getInstance(): SmartHomeService {
    if (!SmartHomeService.instance) {
      SmartHomeService.instance = new SmartHomeService();
    }
    return SmartHomeService.instance;
  }

  private initializeDevices() {
    this.devices = [
      {
        id: 'thermostat_1',
        name: 'Living Room Thermostat',
        type: 'thermostat',
        location: 'Living Room',
        status: 'online',
        isConnected: true,
        lastSeen: new Date(),
        capabilities: ['temperature_control', 'schedule', 'weather_adaptation'],
        settings: {
          currentTemp: 22,
          targetTemp: 22,
          mode: 'auto'
        }
      },
      {
        id: 'garden_system_1',
        name: 'Smart Garden System',
        type: 'garden_system',
        location: 'Garden',
        status: 'online',
        isConnected: true,
        lastSeen: new Date(),
        capabilities: ['watering', 'monitoring', 'weather_adaptation'],
        settings: {
          wateringSchedule: 'daily',
          moistureThreshold: 30
        }
      },
      {
        id: 'energy_monitor_1',
        name: 'Energy Monitor',
        type: 'energy_monitor',
        location: 'Main Panel',
        status: 'online',
        isConnected: true,
        lastSeen: new Date(),
        capabilities: ['usage_monitoring', 'optimization', 'weather_correlation'],
        settings: {
          monitoringInterval: 15
        }
      }
    ];
  }

  private initializeIntegrations() {
    this.integrations = [
      {
        platform: 'homeassistant',
        status: 'connected',
        devices: this.devices,
        lastSync: new Date(),
        capabilities: ['device_control', 'automation', 'monitoring']
      }
    ];
  }

  adjustThermostatForWeather(weather: CurrentWeather, forecast: WeatherForecast): ThermostatControl | null {
    const thermostat = this.devices.find(d => d.type === 'thermostat');
    if (!thermostat) return null;

    const currentTemp = weather.main.temp;
    const humidity = weather.main.humidity;
    const windSpeed = weather.wind.speed;
    const condition = weather.weather[0].main;

    // Calculate optimal temperature based on weather
    let targetTemp = 22; // Default comfortable temperature
    let mode: 'heat' | 'cool' | 'auto' | 'off' = 'auto';

    // Adjust based on outdoor temperature
    if (currentTemp < 10) {
      targetTemp = 24; // Warmer for cold weather
      mode = 'heat';
    } else if (currentTemp > 30) {
      targetTemp = 20; // Cooler for hot weather
      mode = 'cool';
    } else if (currentTemp > 25) {
      targetTemp = 22;
      mode = 'cool';
    } else if (currentTemp < 15) {
      targetTemp = 23;
      mode = 'heat';
    }

    // Adjust for humidity
    if (humidity > 80) {
      targetTemp -= 1; // Slightly cooler for high humidity
    } else if (humidity < 30) {
      targetTemp += 1; // Slightly warmer for low humidity
    }

    // Adjust for wind (wind chill effect)
    if (windSpeed > 10 && currentTemp < 20) {
      targetTemp += 1; // Warmer when it's windy and cold
    }

    // Create schedule based on forecast
    const schedule = forecast.list.slice(0, 8).map(item => ({
      time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      temperature: this.calculateOptimalTemperature(item.main.temp, item.main.humidity),
      mode: (item.main.temp > 25 ? 'cool' : item.main.temp < 15 ? 'heat' : 'auto') as 'heat' | 'cool' | 'auto'
    }));

    return {
      deviceId: thermostat.id,
      currentTemperature: thermostat.settings.currentTemp,
      targetTemperature: Math.round(targetTemp),
      mode,
      fanSpeed: 'auto',
      schedule,
      weatherAdjustment: {
        enabled: true,
        temperatureOffset: Math.round(targetTemp - 22),
        humidityOffset: Math.round(humidity - 50)
      }
    };
  }

  private calculateOptimalTemperature(outdoorTemp: number, humidity: number): number {
    let optimal = 22;
    
    if (outdoorTemp < 10) {
      optimal = 24;
    } else if (outdoorTemp > 30) {
      optimal = 20;
    } else if (outdoorTemp > 25) {
      optimal = 22;
    } else if (outdoorTemp < 15) {
      optimal = 23;
    }

    // Humidity adjustment
    if (humidity > 80) {
      optimal -= 1;
    } else if (humidity < 30) {
      optimal += 1;
    }

    return Math.round(optimal);
  }

  generateGardenCareAlerts(weather: CurrentWeather, forecast: WeatherForecast): GardenCareAlert[] {
    const alerts: GardenCareAlert[] = [];
    const currentTemp = weather.main.temp;
    const humidity = weather.main.humidity;
    const condition = weather.weather[0].main;
    const precipitation = forecast.list.some(item => 
      item.weather[0].main === 'Rain' || item.weather[0].main === 'Drizzle'
    );

    // Watering alerts
    if (!precipitation && humidity < 40) {
      alerts.push({
        id: `garden_${Date.now()}_1`,
        type: 'watering',
        priority: 'high',
        message: 'Low humidity detected - plants need watering',
        recommendedAction: 'Water garden plants and check soil moisture',
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        weatherDependency: {
          condition: 'no_rain',
          temperature: { min: 5, max: 35 },
          humidity: { min: 0, max: 40 }
        },
        isActive: true
      });
    }

    // Protection alerts
    if (currentTemp < 5) {
      alerts.push({
        id: `garden_${Date.now()}_2`,
        type: 'protection',
        priority: 'high',
        message: 'Freezing temperatures - protect sensitive plants',
        recommendedAction: 'Cover sensitive plants or bring them indoors',
        dueDate: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        weatherDependency: {
          condition: 'freezing',
          temperature: { min: -10, max: 5 },
          humidity: { min: 0, max: 100 }
        },
        isActive: true
      });
    }

    // Fertilizing alerts
    if (currentTemp > 15 && currentTemp < 25 && condition === 'Clear') {
      alerts.push({
        id: `garden_${Date.now()}_3`,
        type: 'fertilizing',
        priority: 'medium',
        message: 'Ideal conditions for fertilizing',
        recommendedAction: 'Apply fertilizer to garden plants',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        weatherDependency: {
          condition: 'clear',
          temperature: { min: 15, max: 25 },
          humidity: { min: 40, max: 80 }
        },
        isActive: true
      });
    }

    return alerts;
  }

  generateOutdoorEquipmentAlerts(weather: CurrentWeather, forecast: WeatherForecast): OutdoorEquipmentAlert[] {
    const alerts: OutdoorEquipmentAlert[] = [];
    const condition = weather.weather[0].main;
    const windSpeed = weather.wind.speed;
    const temperature = weather.main.temp;

    // Grill alerts
    if (condition === 'Rain' || condition === 'Thunderstorm') {
      alerts.push({
        id: `equipment_${Date.now()}_1`,
        equipmentType: 'grill',
        action: 'cover',
        priority: 'high',
        message: 'Rain expected - cover your grill',
        recommendedAction: 'Cover grill with waterproof cover to prevent rust',
        dueDate: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        weatherCondition: condition,
        isActive: true
      });
    }

    // Pool alerts
    if (windSpeed > 15) {
      alerts.push({
        id: `equipment_${Date.now()}_2`,
        equipmentType: 'pool',
        action: 'protect',
        priority: 'medium',
        message: 'Strong winds - secure pool area',
        recommendedAction: 'Remove loose items from pool area and secure covers',
        dueDate: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        weatherCondition: 'windy',
        isActive: true
      });
    }

    // Furniture alerts
    if (condition === 'Snow' || temperature < -5) {
      alerts.push({
        id: `equipment_${Date.now()}_3`,
        equipmentType: 'furniture',
        action: 'store',
        priority: 'high',
        message: 'Extreme cold - store outdoor furniture',
        recommendedAction: 'Store outdoor furniture in garage or shed',
        dueDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        weatherCondition: 'extreme_cold',
        isActive: true
      });
    }

    return alerts;
  }

  optimizeEnergyUsage(weather: CurrentWeather, forecast: WeatherForecast): EnergyOptimization[] {
    const optimizations: EnergyOptimization[] = [];
    const currentTemp = weather.main.temp;
    const humidity = weather.main.humidity;
    const windSpeed = weather.wind.speed;
    const condition = weather.weather[0].main;

    // Thermostat optimization
    const thermostat = this.devices.find(d => d.type === 'thermostat');
    if (thermostat) {
      const recommendations = [];
      let potentialSavings = 0;

      if (currentTemp > 25 && condition === 'Clear') {
      recommendations.push({
        action: 'Increase thermostat temperature by 2°C',
        potentialSavings: 15,
        reason: 'Hot weather - reduce cooling load',
        priority: 'high' as 'high' | 'medium' | 'low'
      });
        potentialSavings += 15;
      }

      if (currentTemp < 15 && windSpeed < 5) {
        recommendations.push({
          action: 'Decrease thermostat temperature by 1°C',
          potentialSavings: 8,
          reason: 'Cool weather - reduce heating load',
          priority: 'medium' as 'high' | 'medium' | 'low'
        });
        potentialSavings += 8;
      }

      if (humidity > 80) {
        recommendations.push({
          action: 'Use dehumidifier instead of AC',
          potentialSavings: 12,
          reason: 'High humidity - dehumidifier is more efficient',
          priority: 'medium' as 'high' | 'medium' | 'low'
        });
        potentialSavings += 12;
      }

      optimizations.push({
        deviceId: thermostat.id,
        deviceType: 'thermostat',
        currentUsage: 2.5, // kWh
        weatherImpact: {
          temperature: currentTemp,
          humidity,
          windSpeed,
          solarIrradiance: condition === 'Clear' ? 800 : 200
        },
        recommendations,
        optimalSettings: {
          targetTemperature: this.calculateOptimalTemperature(currentTemp, humidity),
          mode: currentTemp > 25 ? 'cool' : currentTemp < 15 ? 'heat' : 'auto',
          fanSpeed: 'auto'
        }
      });
    }

    // Lighting optimization
    const lighting = this.devices.find(d => d.type === 'lighting');
    if (lighting) {
      const recommendations = [];
      let potentialSavings = 0;

      if (condition === 'Clear') {
        recommendations.push({
          action: 'Turn off outdoor lights during daylight',
          potentialSavings: 20,
          reason: 'Sunny weather - natural light available',
          priority: 'medium' as 'high' | 'medium' | 'low'
        });
        potentialSavings += 20;
      }

      if (currentTemp > 30) {
        recommendations.push({
          action: 'Use LED bulbs to reduce heat output',
          potentialSavings: 10,
          reason: 'Hot weather - reduce heat from lighting',
          priority: 'low' as 'high' | 'medium' | 'low'
        });
        potentialSavings += 10;
      }

      optimizations.push({
        deviceId: lighting.id,
        deviceType: 'lighting',
        currentUsage: 0.8, // kWh
        weatherImpact: {
          temperature: currentTemp,
          humidity,
          windSpeed,
          solarIrradiance: condition === 'Clear' ? 800 : 200
        },
        recommendations,
        optimalSettings: {
          brightness: condition === 'Clear' ? 70 : 100,
          colorTemperature: currentTemp > 25 ? 'cool' : 'warm',
          schedule: 'weather_adaptive'
        }
      });
    }

    return optimizations;
  }

  createWeatherBasedScene(weather: CurrentWeather): SmartHomeScene | null {
    const condition = weather.weather[0].main;
    const temperature = weather.main.temp;
    const humidity = weather.main.humidity;

    let sceneName = '';
    let description = '';
    let temperatureRange = { min: 0, max: 100 };
    let devices = [];

    if (condition === 'Clear' && temperature > 25) {
      sceneName = 'Sunny Day';
      description = 'Optimize for hot, sunny weather';
      temperatureRange = { min: 25, max: 40 };
      devices = [
        {
          deviceId: 'thermostat_1',
          action: 'set_temperature',
          settings: { temperature: 22, mode: 'cool' }
        },
        {
          deviceId: 'lighting_1',
          action: 'set_brightness',
          settings: { brightness: 70, colorTemperature: 'cool' }
        }
      ];
    } else if (condition === 'Rain') {
      sceneName = 'Rainy Day';
      description = 'Create cozy atmosphere for rainy weather';
      temperatureRange = { min: 10, max: 25 };
      devices = [
        {
          deviceId: 'thermostat_1',
          action: 'set_temperature',
          settings: { temperature: 23, mode: 'heat' }
        },
        {
          deviceId: 'lighting_1',
          action: 'set_brightness',
          settings: { brightness: 100, colorTemperature: 'warm' }
        }
      ];
    } else if (condition === 'Snow' || temperature < 5) {
      sceneName = 'Winter Day';
      description = 'Warm and cozy winter setting';
      temperatureRange = { min: -10, max: 10 };
      devices = [
        {
          deviceId: 'thermostat_1',
          action: 'set_temperature',
          settings: { temperature: 24, mode: 'heat' }
        },
        {
          deviceId: 'lighting_1',
          action: 'set_brightness',
          settings: { brightness: 100, colorTemperature: 'warm' }
        }
      ];
    } else {
      return null; // No specific scene for this weather
    }

    return {
      id: `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: sceneName,
      description,
      weatherCondition: condition,
      temperatureRange,
      devices,
      isActive: false,
      lastTriggered: new Date()
    };
  }

  getSmartHomeSettings(): SmartHomeSettings {
    return { ...this.settings };
  }

  updateSmartHomeSettings(settings: Partial<SmartHomeSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  getDevices(): SmartDevice[] {
    return [...this.devices];
  }

  getIntegrations(): IoTIntegration[] {
    return [...this.integrations];
  }

  connectDevice(deviceId: string): boolean {
    const device = this.devices.find(d => d.id === deviceId);
    if (!device) return false;

    device.isConnected = true;
    device.status = 'online';
    device.lastSeen = new Date();
    return true;
  }

  disconnectDevice(deviceId: string): boolean {
    const device = this.devices.find(d => d.id === deviceId);
    if (!device) return false;

    device.isConnected = false;
    device.status = 'offline';
    return true;
  }
}

export const smartHomeService = SmartHomeService.getInstance();
