import { 
  WeatherAnimation, 
  Weather3DModel, 
  WeatherSoundscape, 
  ARWeatherOverlay, 
  WeatherTimeline, 
  WeatherMapLayer, 
  VisualizationSettings 
} from '../types/visualization';
import { CurrentWeather, WeatherForecast } from '../types/weather';

export class VisualizationService {
  private static instance: VisualizationService;
  private settings: VisualizationSettings;

  constructor() {
    this.settings = {
      animations: {
        enabled: true,
        speed: 'normal',
        quality: 'medium',
        batteryOptimization: true
      },
      soundscapes: {
        enabled: false,
        volume: 0.5,
        autoPlay: false,
        fadeIn: 2,
        fadeOut: 2
      },
      ar: {
        enabled: false,
        showOverlays: true,
        dataPoints: ['temperature', 'humidity', 'wind'],
        visualStyle: 'minimal'
      },
      timeline: {
        enabled: true,
        duration: 24,
        interval: 60,
        showTrends: true,
        showForecasts: true
      },
      maps: {
        enabled: true,
        layers: ['temperature', 'precipitation'],
        opacity: 0.7,
        showLegend: true,
        showControls: true
      }
    };
  }

  static getInstance(): VisualizationService {
    if (!VisualizationService.instance) {
      VisualizationService.instance = new VisualizationService();
    }
    return VisualizationService.instance;
  }

  generateTemperatureAnimation(forecast: WeatherForecast): WeatherAnimation {
    const frames: any[] = [];
    const dataPoints = forecast.list.slice(0, 8);
    const temperatures = dataPoints.map(item => item.main.temp);
    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);
    const tempRange = maxTemp - minTemp;

    dataPoints.forEach((item, index) => {
      const normalizedTemp = (item.main.temp - minTemp) / tempRange;
      const color = this.getTemperatureColor(item.main.temp);
      const size = 20 + (normalizedTemp * 30);

      frames.push({
        timestamp: index * 1000,
        data: {
          value: item.main.temp,
          position: { x: index * 50, y: 100 - (normalizedTemp * 80) },
          color,
          size
        },
        transition: {
          duration: 500,
          easing: 'ease-in-out'
        }
      });
    });

    return {
      id: `temp_anim_${Date.now()}`,
      type: 'temperature',
      duration: dataPoints.length,
      frames,
      loop: true,
      speed: 'normal'
    };
  }

  generatePrecipitationAnimation(forecast: WeatherForecast): WeatherAnimation {
    const frames: any[] = [];
    const dataPoints = forecast.list.slice(0, 8);
    const precipitation = dataPoints.map(item => item.pop * 100);

    dataPoints.forEach((item, index) => {
      const intensity = item.pop * 100;
      const color = this.getPrecipitationColor(intensity);
      const size = 10 + (intensity * 0.3);

      frames.push({
        timestamp: index * 1000,
        data: {
          value: intensity,
          position: { x: index * 50, y: 50 },
          color,
          size
        },
        transition: {
          duration: 300,
          easing: 'ease-out'
        }
      });
    });

    return {
      id: `precip_anim_${Date.now()}`,
      type: 'precipitation',
      duration: dataPoints.length,
      frames,
      loop: true,
      speed: 'normal'
    };
  }

  generateWindAnimation(forecast: WeatherForecast): WeatherAnimation {
    const frames: any[] = [];
    const dataPoints = forecast.list.slice(0, 8);

    dataPoints.forEach((item, index) => {
      const speed = item.wind.speed;
      const direction = item.wind.deg;
      const color = this.getWindColor(speed);
      const size = 15 + (speed * 2);

      frames.push({
        timestamp: index * 1000,
        data: {
          value: speed,
          position: { 
            x: 100 + Math.cos(direction * Math.PI / 180) * 30,
            y: 100 + Math.sin(direction * Math.PI / 180) * 30
          },
          color,
          size
        },
        transition: {
          duration: 400,
          easing: 'ease-in-out'
        }
      });
    });

    return {
      id: `wind_anim_${Date.now()}`,
      type: 'wind',
      duration: dataPoints.length,
      frames,
      loop: true,
      speed: 'normal'
    };
  }

  private getTemperatureColor(temp: number): string {
    if (temp < 0) return '#0000FF'; // Blue for cold
    if (temp < 10) return '#0080FF'; // Light blue
    if (temp < 20) return '#00FF00'; // Green for mild
    if (temp < 30) return '#FFFF00'; // Yellow for warm
    return '#FF0000'; // Red for hot
  }

  private getPrecipitationColor(intensity: number): string {
    if (intensity < 20) return '#87CEEB'; // Light blue
    if (intensity < 50) return '#4682B4'; // Steel blue
    if (intensity < 80) return '#1E90FF'; // Dodger blue
    return '#0000CD'; // Medium blue
  }

  private getWindColor(speed: number): string {
    if (speed < 5) return '#90EE90'; // Light green
    if (speed < 10) return '#FFD700'; // Gold
    if (speed < 15) return '#FF8C00'; // Dark orange
    return '#FF4500'; // Orange red
  }

  generateWeather3DModel(weather: CurrentWeather, type: 'temperature' | 'precipitation' | 'wind'): Weather3DModel {
    const temp = weather.main.temp;
    const humidity = weather.main.humidity;
    const windSpeed = weather.wind.speed;
    const condition = weather.weather[0].main;

    let vertices: number[][];
    let colors: number[][];
    let texture = '';

    switch (type) {
      case 'temperature':
        vertices = this.generateTemperatureVertices(temp);
        colors = this.generateTemperatureColors(temp);
        texture = 'temperature_gradient';
        break;
      case 'precipitation':
        vertices = this.generatePrecipitationVertices(condition);
        colors = this.generatePrecipitationColors(condition);
        texture = 'rain_drops';
        break;
      case 'wind':
        vertices = this.generateWindVertices(windSpeed);
        colors = this.generateWindColors(windSpeed);
        texture = 'wind_streams';
        break;
      default:
        vertices = [];
        colors = [];
    }

    return {
      id: `3d_${type}_${Date.now()}`,
      type,
      vertices,
      colors,
      texture,
      animation: {
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        position: { x: 0, y: 0, z: 0 }
      },
      lighting: {
        ambient: 0.4,
        directional: 0.6,
        position: { x: 10, y: 10, z: 10 }
      }
    };
  }

  private generateTemperatureVertices(temp: number): number[][] {
    // Generate a sphere with temperature-based deformation
    const vertices: number[][] = [];
    const radius = 1 + (temp - 20) * 0.1; // Deform based on temperature
    const segments = 32;
    const rings = 16;

    for (let i = 0; i <= rings; i++) {
      const lat = Math.PI * i / rings;
      const y = Math.cos(lat) * radius;
      const scale = Math.sin(lat);

      for (let j = 0; j <= segments; j++) {
        const lon = 2 * Math.PI * j / segments;
        const x = Math.cos(lon) * scale * radius;
        const z = Math.sin(lon) * scale * radius;
        vertices.push([x, y, z]);
      }
    }

    return vertices;
  }

  private generatePrecipitationVertices(condition: string): number[][] {
    const vertices: number[][] = [];
    const count = condition === 'Rain' ? 1000 : condition === 'Snow' ? 500 : 0;

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = Math.random() * 20;
      const z = (Math.random() - 0.5) * 20;
      vertices.push([x, y, z]);
    }

    return vertices;
  }

  private generateWindVertices(speed: number): number[][] {
    const vertices: number[][] = [];
    const count = Math.min(200, speed * 10);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      vertices.push([x, y, z]);
    }

    return vertices;
  }

  private generateTemperatureColors(temp: number): number[][] {
    const colors: number[][] = [];
    const color = this.temperatureToRGB(temp);
    
    // Generate colors for all vertices
    for (let i = 0; i < 1000; i++) {
      colors.push([color.r, color.g, color.b, 1.0]);
    }

    return colors;
  }

  private generatePrecipitationColors(condition: string): number[][] {
    const colors: number[][] = [];
    let color = { r: 0.5, g: 0.5, b: 1.0, a: 0.8 }; // Default blue

    if (condition === 'Snow') {
      color = { r: 1.0, g: 1.0, b: 1.0, a: 0.9 };
    } else if (condition === 'Rain') {
      color = { r: 0.2, g: 0.4, b: 1.0, a: 0.7 };
    }

    for (let i = 0; i < 1000; i++) {
      colors.push([color.r, color.g, color.b, color.a]);
    }

    return colors;
  }

  private generateWindColors(speed: number): number[][] {
    const colors: number[][] = [];
    const intensity = Math.min(1, speed / 20);
    const color = { r: intensity, g: 1 - intensity, b: 0.5, a: 0.6 };

    for (let i = 0; i < 200; i++) {
      colors.push([color.r, color.g, color.b, color.a]);
    }

    return colors;
  }

  private temperatureToRGB(temp: number): { r: number; g: number; b: number; a: number } {
    const normalized = Math.max(0, Math.min(1, (temp + 20) / 60)); // -20 to 40 degrees
    
    if (normalized < 0.25) {
      return { r: 0, g: 0, b: 1, a: 1 }; // Blue
    } else if (normalized < 0.5) {
      return { r: 0, g: 1, b: 1, a: 1 }; // Cyan
    } else if (normalized < 0.75) {
      return { r: 0, g: 1, b: 0, a: 1 }; // Green
    } else {
      return { r: 1, g: 1, b: 0, a: 1 }; // Yellow
    }
  }

  generateWeatherSoundscape(weather: CurrentWeather): WeatherSoundscape {
    const condition = weather.weather[0].main;
    const temperature = weather.main.temp;
    const humidity = weather.main.humidity;
    const windSpeed = weather.wind.speed;

    let name = '';
    let layers: any[] = [];

    switch (condition) {
      case 'Clear':
        name = 'Sunny Day';
        layers = [
          {
            id: 'birds',
            name: 'Birds Chirping',
            audioUrl: '/sounds/birds.mp3',
            volume: 0.3,
            pan: 0,
            frequency: 1000,
            filter: { type: 'highpass', frequency: 500, q: 1 }
          },
          {
            id: 'wind',
            name: 'Gentle Breeze',
            audioUrl: '/sounds/wind.mp3',
            volume: windSpeed > 5 ? 0.4 : 0.2,
            pan: 0,
            frequency: 200,
            filter: { type: 'lowpass', frequency: 2000, q: 1 }
          }
        ];
        break;
      case 'Rain':
        name = 'Rainy Day';
        layers = [
          {
            id: 'rain',
            name: 'Rain Drops',
            audioUrl: '/sounds/rain.mp3',
            volume: 0.6,
            pan: 0,
            frequency: 500,
            filter: { type: 'bandpass', frequency: 1000, q: 2 }
          },
          {
            id: 'thunder',
            name: 'Distant Thunder',
            audioUrl: '/sounds/thunder.mp3',
            volume: 0.2,
            pan: 0,
            frequency: 100,
            filter: { type: 'lowpass', frequency: 500, q: 1 }
          }
        ];
        break;
      case 'Snow':
        name = 'Snowy Day';
        layers = [
          {
            id: 'snow',
            name: 'Snow Falling',
            audioUrl: '/sounds/snow.mp3',
            volume: 0.4,
            pan: 0,
            frequency: 300,
            filter: { type: 'highpass', frequency: 200, q: 1 }
          },
          {
            id: 'wind',
            name: 'Cold Wind',
            audioUrl: '/sounds/cold_wind.mp3',
            volume: 0.3,
            pan: 0,
            frequency: 150,
            filter: { type: 'lowpass', frequency: 1000, q: 1 }
          }
        ];
        break;
      default:
        name = 'Ambient Weather';
        layers = [
          {
            id: 'ambient',
            name: 'Ambient Sounds',
            audioUrl: '/sounds/ambient.mp3',
            volume: 0.2,
            pan: 0,
            frequency: 400,
            filter: { type: 'lowpass', frequency: 2000, q: 1 }
          }
        ];
    }

    return {
      id: `soundscape_${Date.now()}`,
      name,
      weatherCondition: condition,
      audioUrl: layers[0]?.audioUrl || '/sounds/ambient.mp3',
      duration: 300, // 5 minutes
      volume: this.settings.soundscapes.volume,
      loop: true,
      fadeIn: this.settings.soundscapes.fadeIn,
      fadeOut: this.settings.soundscapes.fadeOut,
      layers
    };
  }

  generateARWeatherOverlays(weather: CurrentWeather, location: { latitude: number; longitude: number }): ARWeatherOverlay[] {
    const overlays: ARWeatherOverlay[] = [];
    const temp = weather.main.temp;
    const humidity = weather.main.humidity;
    const windSpeed = weather.wind.speed;
    const pressure = weather.main.pressure;
    const uvIndex = 0; // Would be calculated from UV data

    // Temperature overlay
    overlays.push({
      id: `ar_temp_${Date.now()}`,
      type: 'temperature',
      position: {
        latitude: location.latitude,
        longitude: location.longitude,
        altitude: 0
      },
      data: {
        value: temp,
        unit: '°C',
        trend: 'stable'
      },
      visual: {
        color: this.getTemperatureColor(temp),
        size: 50,
        opacity: 0.8,
        shape: 'circle'
      },
      animation: {
        type: 'pulse',
        speed: 1,
        intensity: 0.5
      }
    });

    // Humidity overlay
    overlays.push({
      id: `ar_humidity_${Date.now()}`,
      type: 'humidity',
      position: {
        latitude: location.latitude + 0.001,
        longitude: location.longitude + 0.001,
        altitude: 0
      },
      data: {
        value: humidity,
        unit: '%',
        trend: 'stable'
      },
      visual: {
        color: '#00BFFF',
        size: 40,
        opacity: 0.7,
        shape: 'square'
      },
      animation: {
        type: 'float',
        speed: 0.5,
        intensity: 0.3
      }
    });

    // Wind overlay
    overlays.push({
      id: `ar_wind_${Date.now()}`,
      type: 'wind',
      position: {
        latitude: location.latitude - 0.001,
        longitude: location.longitude - 0.001,
        altitude: 0
      },
      data: {
        value: windSpeed,
        unit: 'm/s',
        trend: 'stable'
      },
      visual: {
        color: this.getWindColor(windSpeed),
        size: 45,
        opacity: 0.8,
        shape: 'arrow'
      },
      animation: {
        type: 'rotate',
        speed: windSpeed * 0.1,
        intensity: 0.6
      }
    });

    return overlays;
  }

  generateWeatherTimeline(forecast: WeatherForecast, type: 'temperature' | 'precipitation' | 'wind' | 'humidity'): WeatherTimeline {
    const dataPoints = forecast.list.slice(0, 24); // 24 hours
    const timelineData = dataPoints.map((item, index) => {
      let value = 0;
      let label = '';
      let color = '';

      switch (type) {
        case 'temperature':
          value = item.main.temp;
          label = `${Math.round(value)}°C`;
          color = this.getTemperatureColor(value);
          break;
        case 'precipitation':
          value = item.pop * 100;
          label = `${Math.round(value)}%`;
          color = this.getPrecipitationColor(value);
          break;
        case 'wind':
          value = item.wind.speed;
          label = `${Math.round(value)} m/s`;
          color = this.getWindColor(value);
          break;
        case 'humidity':
          value = item.main.humidity;
          label = `${Math.round(value)}%`;
          color = '#00BFFF';
          break;
      }

      return {
        timestamp: new Date(item.dt * 1000),
        value,
        label,
        color,
        size: 20
      };
    });

    return {
      id: `timeline_${type}_${Date.now()}`,
      startTime: new Date(dataPoints[0].dt * 1000),
      endTime: new Date(dataPoints[dataPoints.length - 1].dt * 1000),
      interval: 60, // 1 hour
      data: timelineData,
      visualization: {
        type: 'line',
        color: this.getTimelineColor(type),
        thickness: 3,
        opacity: 0.8
      }
    };
  }

  private getTimelineColor(type: string): string {
    switch (type) {
      case 'temperature': return '#FF6B6B';
      case 'precipitation': return '#4ECDC4';
      case 'wind': return '#45B7D1';
      case 'humidity': return '#96CEB4';
      default: return '#95A5A6';
    }
  }

  generateWeatherMapLayers(): WeatherMapLayer[] {
    return [
      {
        id: 'temperature_layer',
        name: 'Temperature',
        type: 'temperature',
        opacity: 0.7,
        visible: true,
        data: {
          url: 'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png',
          format: 'png',
          bounds: { north: 85, south: -85, east: 180, west: -180 }
        },
        style: {
          colorScheme: 'temperature',
          minValue: -50,
          maxValue: 50,
          interpolation: 'linear'
        }
      },
      {
        id: 'precipitation_layer',
        name: 'Precipitation',
        type: 'precipitation',
        opacity: 0.6,
        visible: false,
        data: {
          url: 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png',
          format: 'png',
          bounds: { north: 85, south: -85, east: 180, west: -180 }
        },
        style: {
          colorScheme: 'precipitation',
          minValue: 0,
          maxValue: 100,
          interpolation: 'linear'
        }
      },
      {
        id: 'wind_layer',
        name: 'Wind Speed',
        type: 'wind',
        opacity: 0.5,
        visible: false,
        data: {
          url: 'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png',
          format: 'png',
          bounds: { north: 85, south: -85, east: 180, west: -180 }
        },
        style: {
          colorScheme: 'wind',
          minValue: 0,
          maxValue: 50,
          interpolation: 'linear'
        }
      }
    ];
  }

  getVisualizationSettings(): VisualizationSettings {
    return { ...this.settings };
  }

  updateVisualizationSettings(settings: Partial<VisualizationSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }
}

export const visualizationService = VisualizationService.getInstance();
