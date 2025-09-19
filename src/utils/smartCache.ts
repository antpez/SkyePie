import { LocationCoordinates } from '../types';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  location: LocationCoordinates;
  accuracy: number; // Location accuracy in meters
  ttl: number; // Time to live in milliseconds
}

export interface SmartCacheConfig {
  baseTTL: number; // Base TTL in milliseconds
  accuracyMultiplier: number; // How much to extend TTL based on accuracy
  maxTTL: number; // Maximum TTL in milliseconds
  minTTL: number; // Minimum TTL in milliseconds
}

export class SmartCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: SmartCacheConfig;

  constructor(config: SmartCacheConfig) {
    this.config = config;
  }

  /**
   * Generate cache key based on location coordinates and additional parameters
   */
  private generateKey(location: LocationCoordinates, additionalParams?: Record<string, any>): string {
    const lat = location.latitude.toFixed(4);
    const lon = location.longitude.toFixed(4);
    const params = additionalParams ? JSON.stringify(additionalParams) : '';
    return `${lat},${lon}${params ? `_${params}` : ''}`;
  }

  /**
   * Calculate TTL based on location accuracy
   * More accurate locations get longer cache times
   */
  private calculateTTL(accuracy: number): number {
    const { baseTTL, accuracyMultiplier, maxTTL, minTTL } = this.config;
    
    // Higher accuracy (lower number) = longer TTL
    const accuracyFactor = Math.max(0, 100 - accuracy) / 100; // 0-1 scale
    const calculatedTTL = baseTTL + (baseTTL * accuracyFactor * accuracyMultiplier);
    
    return Math.min(Math.max(calculatedTTL, minTTL), maxTTL);
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry<T>): boolean {
    const now = Date.now();
    return (now - entry.timestamp) < entry.ttl;
  }

  /**
   * Check if location has changed significantly
   */
  private hasLocationChanged(
    currentLocation: LocationCoordinates, 
    cachedLocation: LocationCoordinates, 
    threshold: number = 0.001
  ): boolean {
    const latDiff = Math.abs(currentLocation.latitude - cachedLocation.latitude);
    const lonDiff = Math.abs(currentLocation.longitude - cachedLocation.longitude);
    return latDiff > threshold || lonDiff > threshold;
  }

  /**
   * Check if accuracy has improved significantly
   */
  private hasAccuracyImproved(currentAccuracy: number, cachedAccuracy: number, threshold: number = 20): boolean {
    return currentAccuracy < (cachedAccuracy - threshold);
  }

  /**
   * Get cached data if valid and location hasn't changed significantly
   */
  get(
    location: LocationCoordinates, 
    additionalParams?: Record<string, any>
  ): T | null {
    const key = this.generateKey(location, additionalParams);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry is still valid
    if (!this.isValid(entry)) {
      this.cache.delete(key);
      return null;
    }

    // Check if location has changed significantly
    if (this.hasLocationChanged(location, entry.location)) {
      this.cache.delete(key);
      return null;
    }

    // If current location is more accurate, consider updating cache
    const currentAccuracy = location.accuracy || 100;
    if (this.hasAccuracyImproved(currentAccuracy, entry.accuracy)) {
      console.log(`📍 Location accuracy improved from ${entry.accuracy}m to ${currentAccuracy}m, cache may need refresh`);
    }

    return entry.data;
  }

  /**
   * Store data in cache with location-aware TTL
   */
  set(
    location: LocationCoordinates, 
    data: T, 
    additionalParams?: Record<string, any>
  ): void {
    const key = this.generateKey(location, additionalParams);
    const accuracy = location.accuracy || 100;
    const ttl = this.calculateTTL(accuracy);

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      location: { ...location },
      accuracy,
      ttl,
    };

    this.cache.set(key, entry);
    
    console.log(`💾 Cached data with accuracy ${accuracy}m, TTL: ${Math.round(ttl / 1000)}s`);
  }

  /**
   * Invalidate cache entries for a specific location
   */
  invalidate(location: LocationCoordinates, additionalParams?: Record<string, any>): void {
    const key = this.generateKey(location, additionalParams);
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    entries: Array<{
      key: string;
      age: number;
      accuracy: number;
      ttl: number;
      isValid: boolean;
    }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      accuracy: entry.accuracy,
      ttl: entry.ttl,
      isValid: this.isValid(entry),
    }));

    return {
      size: this.cache.size,
      entries,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValid(entry)) {
        this.cache.delete(key);
      }
    }
  }
}

// Default configuration for weather data caching
export const WEATHER_CACHE_CONFIG: SmartCacheConfig = {
  baseTTL: 10 * 60 * 1000, // 10 minutes base
  accuracyMultiplier: 2, // Double TTL for high accuracy
  maxTTL: 60 * 60 * 1000, // 1 hour maximum
  minTTL: 5 * 60 * 1000, // 5 minutes minimum
};

// Default configuration for location data caching
export const LOCATION_CACHE_CONFIG: SmartCacheConfig = {
  baseTTL: 30 * 60 * 1000, // 30 minutes base
  accuracyMultiplier: 1.5, // 1.5x TTL for high accuracy
  maxTTL: 4 * 60 * 60 * 1000, // 4 hours maximum
  minTTL: 10 * 60 * 1000, // 10 minutes minimum
};

// Singleton instances
export const weatherSmartCache = new SmartCache(WEATHER_CACHE_CONFIG);
export const locationSmartCache = new SmartCache(LOCATION_CACHE_CONFIG);
