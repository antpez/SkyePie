import { WeatherMapType, WeatherMapData, WeatherMapConfig, WeatherMapLayer } from '../types/weatherMaps';

export class WeatherMapsService {
  private static instance: WeatherMapsService;
  private apiKey: string;
  private baseUrl = 'https://tile.openweathermap.org/map';

  private constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  static getInstance(apiKey: string): WeatherMapsService {
    if (!WeatherMapsService.instance) {
      WeatherMapsService.instance = new WeatherMapsService(apiKey);
    }
    return WeatherMapsService.instance;
  }

  // Generate map tile URL for a specific layer
  generateTileUrl(layer: WeatherMapType, z: number, x: number, y: number): string {
    const layerMap: { [key in WeatherMapType]: string } = {
      precipitation: 'precipitation_new',
      temperature: 'temp_new',
      wind: 'wind_new',
      clouds: 'clouds_new',
      pressure: 'pressure_new',
      visibility: 'visibility_new',
      convective_precipitation: 'precipitation_new',
      precipitation_intensity: 'precipitation_new',
      rain_accumulation: 'precipitation_new',
      snow_accumulation: 'precipitation_new',
      snow_depth: 'precipitation_new',
      wind_speed: 'wind_new',
      wind_arrows: 'wind_new',
      atmospheric_pressure: 'pressure_new',
      air_temperature: 'temp_new',
      dew_point: 'temp_new',
      soil_temperature: 'temp_new',
      soil_temperature_deep: 'temp_new',
      humidity: 'humidity_new',
    };

    const layerName = layerMap[layer];
    return `${this.baseUrl}/${layerName}/${z}/${x}/${y}.png?appid=${this.apiKey}`;
  }

  // Get available map layers
  getAvailableLayers(): WeatherMapType[] {
    return ['precipitation', 'temperature', 'wind', 'clouds', 'pressure', 'visibility'];
  }

  // Validate map configuration
  validateMapConfig(config: Partial<WeatherMapConfig>): boolean {
    if (!config.center || typeof config.center.lat !== 'number' || typeof config.center.lon !== 'number') {
      return false;
    }

    if (config.zoom && (config.zoom < 1 || config.zoom > 18)) {
      return false;
    }

    if (config.layers) {
      for (const layer of config.layers) {
        if (!this.isValidLayer(layer)) {
          return false;
        }
      }
    }

    return true;
  }

  // Validate individual layer
  private isValidLayer(layer: WeatherMapLayer): boolean {
    return (
      typeof layer.id === 'string' &&
      typeof layer.name === 'string' &&
      typeof layer.type === 'string' &&
      typeof layer.opacity === 'number' &&
      typeof layer.visible === 'boolean' &&
      typeof layer.zIndex === 'number' &&
      layer.opacity >= 0 &&
      layer.opacity <= 1
    );
  }

  // Get map bounds for a given center and zoom
  getMapBounds(center: { lat: number; lon: number }, zoom: number): {
    north: number;
    south: number;
    east: number;
    west: number;
  } {
    const latRad = (center.lat * Math.PI) / 180;
    const n = Math.pow(2, zoom);
    const lonDeg = center.lon / n;
    const latDeg = Math.atan(Math.sinh(Math.PI * (1 - 2 * center.lat / n))) * 180 / Math.PI;

    const latDelta = 180 / n;
    const lonDelta = 360 / n;

    return {
      north: latDeg + latDelta / 2,
      south: latDeg - latDelta / 2,
      east: lonDeg + lonDelta / 2,
      west: lonDeg - lonDelta / 2,
    };
  }

  // Calculate optimal zoom level for a given area
  calculateOptimalZoom(
    bounds: { north: number; south: number; east: number; west: number },
    mapSize: { width: number; height: number }
  ): number {
    const latDiff = bounds.north - bounds.south;
    const lonDiff = bounds.east - bounds.west;

    const latZoom = Math.log2(360 / latDiff);
    const lonZoom = Math.log2(360 / lonDiff);

    return Math.min(Math.floor(Math.min(latZoom, lonZoom)), 18);
  }

  // Get map tile coordinates for a given lat/lon and zoom
  getTileCoordinates(lat: number, lon: number, zoom: number): { x: number; y: number; z: number } {
    const n = Math.pow(2, zoom);
    const x = Math.floor(((lon + 180) / 360) * n);
    const y = Math.floor(((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2) * n);
    
    return { x, y, z: zoom };
  }

  // Check if a tile exists (basic validation)
  async validateTileExists(layer: WeatherMapType, x: number, y: number, z: number): Promise<boolean> {
    try {
      const url = this.generateTileUrl(layer, z, x, y);
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.warn(`Failed to validate tile for ${layer} at ${x},${y},${z}:`, error);
      return false;
    }
  }

  // Get map data for a specific area and layer
  async getMapData(
    layer: WeatherMapType,
    bounds: { north: number; south: number; east: number; west: number },
    zoom: number
  ): Promise<WeatherMapData | null> {
    try {
      // This is a simplified implementation
      // In a real app, you might want to fetch actual weather data
      // and overlay it on the map tiles
      
      const center = {
        lat: (bounds.north + bounds.south) / 2,
        lon: (bounds.east + bounds.west) / 2,
      };

      const tileCoords = this.getTileCoordinates(center.lat, center.lon, zoom);
      
      return {
        type: layer,
        timestamp: Date.now(),
        data: [], // Would contain actual weather data points
        bounds,
      };
    } catch (error) {
      console.error(`Failed to get map data for ${layer}:`, error);
      return null;
    }
  }

  // Update API key
  updateApiKey(newApiKey: string): void {
    this.apiKey = newApiKey;
  }

  // Get service status
  async getServiceStatus(): Promise<{ available: boolean; layers: WeatherMapType[] }> {
    try {
      // Test with a simple tile request
      const testUrl = this.generateTileUrl('precipitation', 1, 0, 0);
      const response = await fetch(testUrl, { method: 'HEAD' });
      
      return {
        available: response.ok,
        layers: this.getAvailableLayers(),
      };
    } catch (error) {
      console.error('Failed to check weather maps service status:', error);
      return {
        available: false,
        layers: [],
      };
    }
  }
}

export const weatherMapsService = WeatherMapsService.getInstance(process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '');
