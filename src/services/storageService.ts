import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { UserSettings, Location, SearchHistoryItem } from '../types';

export class StorageService {
  private static instance: StorageService;

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw error;
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  // User Settings
  async saveUserSettings(settings: UserSettings): Promise<void> {
    return this.setItem(STORAGE_KEYS.userSettings, settings);
  }

  async getUserSettings(): Promise<UserSettings | null> {
    return this.getItem<UserSettings>(STORAGE_KEYS.userSettings);
  }

  // Favorite Locations
  async saveFavoriteLocations(locations: Location[]): Promise<void> {
    return this.setItem(STORAGE_KEYS.favoriteLocations, locations);
  }

  async getFavoriteLocations(): Promise<Location[]> {
    const locations = await this.getItem<Location[]>(STORAGE_KEYS.favoriteLocations);
    return locations || [];
  }

  async addFavoriteLocation(location: Location): Promise<void> {
    const favorites = await this.getFavoriteLocations();
    const exists = favorites.some(fav => 
      Math.abs(fav.latitude - location.latitude) < 0.0001 &&
      Math.abs(fav.longitude - location.longitude) < 0.0001
    );
    
    if (!exists) {
      favorites.push(location);
      await this.saveFavoriteLocations(favorites);
    }
  }

  async removeFavoriteLocation(locationId: string): Promise<void> {
    const favorites = await this.getFavoriteLocations();
    const filtered = favorites.filter(fav => fav.id !== locationId);
    await this.saveFavoriteLocations(filtered);
  }

  // Search History
  async saveSearchHistory(history: SearchHistoryItem[]): Promise<void> {
    return this.setItem(STORAGE_KEYS.searchHistory, history);
  }

  async getSearchHistory(): Promise<SearchHistoryItem[]> {
    const history = await this.getItem<SearchHistoryItem[]>(STORAGE_KEYS.searchHistory);
    return history || [];
  }

  async addSearchHistory(item: SearchHistoryItem): Promise<void> {
    const history = await this.getSearchHistory();
    
    // Remove existing item with same query
    const filtered = history.filter(h => h.query !== item.query);
    
    // Add new item to beginning
    filtered.unshift(item);
    
    // Keep only last 10 items
    const limited = filtered.slice(0, 10);
    
    await this.saveSearchHistory(limited);
  }

  async clearSearchHistory(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.searchHistory);
  }

  // Last Known Location
  async saveLastKnownLocation(location: Location): Promise<void> {
    return this.setItem(STORAGE_KEYS.lastKnownLocation, location);
  }

  async getLastKnownLocation(): Promise<Location | null> {
    return this.getItem<Location>(STORAGE_KEYS.lastKnownLocation);
  }

  // Selected Location (for weather display)
  async saveSelectedLocation(location: Location | null): Promise<void> {
    return this.setItem(STORAGE_KEYS.selectedLocation, location);
  }

  async getSelectedLocation(): Promise<Location | null> {
    return this.getItem<Location>(STORAGE_KEYS.selectedLocation);
  }

  // Theme
  async saveTheme(theme: 'light' | 'dark' | 'auto'): Promise<void> {
    return this.setItem(STORAGE_KEYS.theme, theme);
  }

  async getTheme(): Promise<'light' | 'dark' | 'auto'> {
    const theme = await this.getItem<'light' | 'dark' | 'auto'>(STORAGE_KEYS.theme);
    return theme || 'auto';
  }

  // Permissions
  async savePermissions(permissions: Record<string, boolean>): Promise<void> {
    return this.setItem(STORAGE_KEYS.permissions, permissions);
  }

  async getPermissions(): Promise<Record<string, boolean>> {
    const permissions = await this.getItem<Record<string, boolean>>(STORAGE_KEYS.permissions);
    return permissions || {};
  }

  async setPermission(permission: string, granted: boolean): Promise<void> {
    const permissions = await this.getPermissions();
    permissions[permission] = granted;
    await this.savePermissions(permissions);
  }

  async getPermission(permission: string): Promise<boolean> {
    const permissions = await this.getPermissions();
    return permissions[permission] || false;
  }
}

export const storageService = StorageService.getInstance();
