import { CurrentWeather, WeatherForecast, Location, LocationSearchResult, SearchHistoryItem } from '../types';
import { weatherRepository, locationRepository, searchHistoryRepository } from '../database';
import { generateId } from '../utils/helpers';
import { APP_CONFIG } from '../config/app';

export interface CachedWeatherData {
  data: CurrentWeather | WeatherForecast;
  timestamp: number;
  location: { latitude: number; longitude: number };
  expiresAt: Date;
}

export interface CachedLocationData {
  data: LocationSearchResult[];
  timestamp: number;
  query: string;
  expiresAt: Date;
}

export class OfflineCacheService {
  private static instance: OfflineCacheService;

  static getInstance(): OfflineCacheService {
    if (!OfflineCacheService.instance) {
      OfflineCacheService.instance = new OfflineCacheService();
    }
    return OfflineCacheService.instance;
  }

  // Weather caching methods
  async cacheCurrentWeather(
    location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>,
    weather: CurrentWeather,
    userId: string
  ): Promise<void> {
    try {
      // Save or update location in database
      const savedLocation = await this.saveLocationToDatabase(location, userId);
      
      // Calculate expiration time
      const expiresAt = new Date(Date.now() + APP_CONFIG.cache.weatherTTL);
      
      // Cache weather data
      await weatherRepository.saveWeatherCache(
        savedLocation.id,
        'current',
        weather,
        expiresAt
      );
    } catch (error) {
      console.error('Error caching current weather:', error);
      throw error;
    }
  }

  async cacheWeatherForecast(
    location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>,
    forecast: WeatherForecast,
    userId: string
  ): Promise<void> {
    try {
      // Save or update location in database
      const savedLocation = await this.saveLocationToDatabase(location, userId);
      
      // Calculate expiration time
      const expiresAt = new Date(Date.now() + APP_CONFIG.cache.forecastTTL);
      
      // Cache forecast data
      await weatherRepository.saveWeatherCache(
        savedLocation.id,
        'forecast',
        forecast,
        expiresAt
      );
    } catch (error) {
      console.error('Error caching weather forecast:', error);
      throw error;
    }
  }

  async getCachedCurrentWeather(
    location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<CurrentWeather | null> {
    try {
      const savedLocation = await this.findLocationInDatabase(location, userId);
      if (!savedLocation) return null;

      const cached = await weatherRepository.getWeatherCache<CurrentWeather>(
        savedLocation.id,
        'current'
      );

      return cached;
    } catch (error) {
      console.error('Error getting cached current weather:', error);
      return null;
    }
  }

  async getCachedWeatherForecast(
    location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<WeatherForecast | null> {
    try {
      const savedLocation = await this.findLocationInDatabase(location, userId);
      if (!savedLocation) return null;

      const cached = await weatherRepository.getWeatherCache<WeatherForecast>(
        savedLocation.id,
        'forecast'
      );

      return cached;
    } catch (error) {
      console.error('Error getting cached weather forecast:', error);
      return null;
    }
  }

  // Location caching methods
  async cacheLocationSearch(
    query: string,
    results: LocationSearchResult[],
    userId: string
  ): Promise<void> {
    try {
      // Save search history
      const locationId = results[0] ? `${results[0].latitude}-${results[0].longitude}` : undefined;
      await this.saveSearchHistory(query, locationId, userId);
      
      // Save locations to database
      for (const result of results) {
        const location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'> = {
          userId,
          name: result.name,
          country: result.country,
          state: result.state,
          latitude: result.latitude,
          longitude: result.longitude,
          timezone: undefined,
          isCurrent: false,
          isFavorite: false,
          searchCount: 1,
          lastSearched: new Date(),
        };
        
        await this.saveLocationToDatabase(location, userId);
      }
    } catch (error) {
      console.error('Error caching location search:', error);
      throw error;
    }
  }

  async getCachedLocationSearch(
    query: string,
    userId: string
  ): Promise<LocationSearchResult[]> {
    try {
      const locations = await locationRepository.searchLocations(query, 10);
      
      return locations.map(location => ({
        name: location.name,
        country: location.country,
        state: location.state,
        latitude: location.latitude,
        longitude: location.longitude,
        displayName: `${location.name}${location.state ? `, ${location.state}` : ''}, ${location.country}`,
      }));
    } catch (error) {
      console.error('Error getting cached location search:', error);
      return [];
    }
  }

  // Location management methods
  async saveLocationToDatabase(
    location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<Location> {
    try {
      // Check if location already exists
      const existingLocation = await this.findLocationInDatabase(location, userId);
      
      if (existingLocation) {
        // Update search count and last searched
        await locationRepository.updateLocation(existingLocation.id, {
          searchCount: existingLocation.searchCount + 1,
          lastSearched: new Date(),
        });
        
        return {
          ...existingLocation,
          searchCount: existingLocation.searchCount + 1,
          lastSearched: new Date(),
        };
      }

      // Create new location
      return await locationRepository.saveLocation({
        ...location,
        userId,
      });
    } catch (error) {
      console.error('Error saving location to database:', error);
      throw error;
    }
  }

  async findLocationInDatabase(
    location: { latitude: number; longitude: number },
    userId: string
  ): Promise<Location | null> {
    try {
      // Find location by coordinates (with small tolerance for floating point precision)
      const locations = await locationRepository.searchLocations('', 100);
      
      return locations.find(loc => 
        loc.userId === userId &&
        Math.abs(loc.latitude - location.latitude) < 0.0001 &&
        Math.abs(loc.longitude - location.longitude) < 0.0001
      ) || null;
    } catch (error) {
      console.error('Error finding location in database:', error);
      return null;
    }
  }

  async setCurrentLocation(location: Location, userId: string): Promise<void> {
    try {
      // First, unset all current locations for this user
      const allLocations = await locationRepository.searchLocations('', 100);
      const userLocations = allLocations.filter(loc => loc.userId === userId);
      
      for (const loc of userLocations) {
        if (loc.isCurrent) {
          await locationRepository.updateLocation(loc.id, { isCurrent: false });
        }
      }

      // Set the new current location
      const savedLocation = await this.saveLocationToDatabase(location, userId);
      await locationRepository.updateLocation(savedLocation.id, { isCurrent: true });
    } catch (error) {
      console.error('Error setting current location:', error);
      throw error;
    }
  }

  async getCurrentLocation(userId: string): Promise<Location | null> {
    try {
      return await locationRepository.getCurrentLocation(userId);
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  async getFavoriteLocations(userId: string): Promise<Location[]> {
    try {
      return await locationRepository.getFavoriteLocations(userId);
    } catch (error) {
      console.error('Error getting favorite locations:', error);
      return [];
    }
  }

  async addFavoriteLocation(location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<void> {
    try {
      const savedLocation = await this.saveLocationToDatabase(location, userId);
      await locationRepository.updateLocation(savedLocation.id, { isFavorite: true });
    } catch (error) {
      console.error('Error adding favorite location:', error);
      throw error;
    }
  }

  async removeFavoriteLocation(locationId: string): Promise<void> {
    try {
      await locationRepository.updateLocation(locationId, { isFavorite: false });
    } catch (error) {
      console.error('Error removing favorite location:', error);
      throw error;
    }
  }

  // Search history methods
  async saveSearchHistory(
    query: string,
    locationId: string | undefined,
    userId: string
  ): Promise<void> {
    try {
      await searchHistoryRepository.saveSearchHistory(
        userId,
        query,
        locationId,
        'manual'
      );
    } catch (error) {
      console.error('Error saving search history:', error);
      throw error;
    }
  }

  async getSearchHistory(userId: string): Promise<SearchHistoryItem[]> {
    try {
      return await searchHistoryRepository.getSearchHistory(userId, 10);
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  async clearSearchHistory(userId: string): Promise<void> {
    try {
      await searchHistoryRepository.clearSearchHistory(userId);
    } catch (error) {
      console.error('Error clearing search history:', error);
      throw error;
    }
  }

  // Cache management methods
  async clearExpiredCache(): Promise<void> {
    try {
      await weatherRepository.clearExpiredCache();
    } catch (error) {
      console.error('Error clearing expired cache:', error);
      throw error;
    }
  }

  async clearAllCache(): Promise<void> {
    try {
      // This would need to be implemented in the repositories
      console.log('Clearing all cache');
    } catch (error) {
      console.error('Error clearing all cache:', error);
      throw error;
    }
  }

  // Utility methods
  async isLocationCached(
    location: { latitude: number; longitude: number },
    userId: string
  ): Promise<boolean> {
    try {
      const savedLocation = await this.findLocationInDatabase(location, userId);
      if (!savedLocation) return false;

      // Check if we have current weather cached
      const currentWeather = await weatherRepository.getWeatherCache<CurrentWeather>(
        savedLocation.id,
        'current'
      );

      return currentWeather !== null;
    } catch (error) {
      console.error('Error checking if location is cached:', error);
      return false;
    }
  }

  async getCacheInfo(userId: string): Promise<{
    totalLocations: number;
    favoriteLocations: number;
    cachedWeatherLocations: number;
  }> {
    try {
      const allLocations = await locationRepository.searchLocations('', 100);
      const userLocations = allLocations.filter(loc => loc.userId === userId);
      const favoriteLocations = userLocations.filter(loc => loc.isFavorite);
      
      let cachedWeatherLocations = 0;
      for (const location of userLocations) {
        const hasCurrentWeather = await weatherRepository.getWeatherCache<CurrentWeather>(
          location.id,
          'current'
        );
        if (hasCurrentWeather) cachedWeatherLocations++;
      }

      return {
        totalLocations: userLocations.length,
        favoriteLocations: favoriteLocations.length,
        cachedWeatherLocations,
      };
    } catch (error) {
      console.error('Error getting cache info:', error);
      return {
        totalLocations: 0,
        favoriteLocations: 0,
        cachedWeatherLocations: 0,
      };
    }
  }
}

export const offlineCacheService = OfflineCacheService.getInstance();
