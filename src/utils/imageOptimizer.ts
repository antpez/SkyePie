import { Image } from 'react-native';

interface ImageCache {
  [key: string]: {
    uri: string;
    width: number;
    height: number;
    timestamp: number;
  };
}

interface ImageLoadOptions {
  width?: number;
  height?: number;
  quality?: 'low' | 'medium' | 'high';
  cache?: boolean;
  priority?: 'low' | 'normal' | 'high';
}

class ImageOptimizer {
  private cache: ImageCache = {};
  private readonly CACHE_SIZE_LIMIT = 100;
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  // Preload images for better performance
  async preloadImages(imageUris: any[]): Promise<void> {
    console.log('preloadImages called with:', imageUris);
    const preloadPromises = imageUris.map((uri, index) => {
      console.log(`Preloading image ${index}:`, uri);
      return this.preloadImage(uri);
    });
    await Promise.allSettled(preloadPromises);
  }

  // Preload a single image
  async preloadImage(uri: any): Promise<void> {
    try {
      console.log('preloadImage called with:', uri, 'type:', typeof uri);
      
      // Check if uri is valid
      if (!uri) {
        console.warn('preloadImage: uri is null/undefined');
        return;
      }
      
      // For local images (require results), we don't need to prefetch
      if (typeof uri === 'object' && uri.uri === undefined) {
        console.log('Skipping preload for local image (require result)');
        return;
      }
      
      await Image.prefetch(uri);
      console.log(`✅ Preloaded image: ${uri}`);
    } catch (error) {
      console.warn(`❌ Failed to preload image: ${uri}`, error);
    }
  }

  // Get optimized image URI with caching
  getOptimizedImageUri(
    baseUri: string, 
    options: ImageLoadOptions = {}
  ): string {
    const {
      width,
      height,
      quality = 'medium',
      cache = true
    } = options;

    // Create cache key
    const cacheKey = `${baseUri}_${width || 'auto'}_${height || 'auto'}_${quality}`;

    // Check cache first
    if (cache && this.cache[cacheKey]) {
      const cached = this.cache[cacheKey];
      if (Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.uri;
      } else {
        // Remove expired cache entry
        delete this.cache[cacheKey];
      }
    }

    // Generate optimized URI
    let optimizedUri = baseUri;

    // Add size parameters if provided
    if (width || height) {
      const params = new URLSearchParams();
      if (width) params.append('w', width.toString());
      if (height) params.append('h', height.toString());
      if (quality) params.append('q', this.getQualityValue(quality));
      
      const separator = baseUri.includes('?') ? '&' : '?';
      optimizedUri = `${baseUri}${separator}${params.toString()}`;
    }

    // Cache the result
    if (cache) {
      this.cache[cacheKey] = {
        uri: optimizedUri,
        width: width || 0,
        height: height || 0,
        timestamp: Date.now()
      };

      // Manage cache size
      this.manageCacheSize();
    }

    return optimizedUri;
  }

  // Get quality value for different quality levels
  private getQualityValue(quality: 'low' | 'medium' | 'high'): string {
    switch (quality) {
      case 'low': return '60';
      case 'medium': return '80';
      case 'high': return '95';
      default: return '80';
    }
  }

  // Manage cache size by removing oldest entries
  private manageCacheSize(): void {
    const entries = Object.entries(this.cache);
    if (entries.length > this.CACHE_SIZE_LIMIT) {
      // Sort by timestamp and remove oldest 25%
      const sortedEntries = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = sortedEntries.slice(0, Math.floor(entries.length * 0.25));
      
      toRemove.forEach(([key]) => {
        delete this.cache[key];
      });
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache = {};
  }

  // Get cache stats
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: Object.keys(this.cache).length,
      entries: Object.keys(this.cache)
    };
  }

  // Static mapping of weather icons to avoid dynamic require issues
  private weatherIconMap: { [key: string]: any } = {
    'clear_night.png': require('../assets/images/weather-icons/clear_night.png'),
    'clearing.png': require('../assets/images/weather-icons/clearing.png'),
    'cloudy_night_full.png': require('../assets/images/weather-icons/cloudy_night_full.png'),
    'cloudy_night_half.png': require('../assets/images/weather-icons/cloudy_night_half.png'),
    'cloudy.png': require('../assets/images/weather-icons/cloudy.png'),
    'cloudy1.png': require('../assets/images/weather-icons/cloudy1.png'),
    'danger.png': require('../assets/images/weather-icons/danger.png'),
    'evening.png': require('../assets/images/weather-icons/evening.png'),
    'extreme_heat.png': require('../assets/images/weather-icons/extreme_heat.png'),
    'full_clear_night.png': require('../assets/images/weather-icons/full_clear_night.png'),
    'full_moon.png': require('../assets/images/weather-icons/full_moon.png'),
    'half_moon.png': require('../assets/images/weather-icons/half_moon.png'),
    'heavy_storm.png': require('../assets/images/weather-icons/heavy_storm.png'),
    'light_cloudy.png': require('../assets/images/weather-icons/light_cloudy.png'),
    'light_rain.png': require('../assets/images/weather-icons/light_rain.png'),
    'partly_cloudy.png': require('../assets/images/weather-icons/partly_cloudy.png'),
    'rain_passing.png': require('../assets/images/weather-icons/rain_passing.png'),
    'rain.png': require('../assets/images/weather-icons/rain.png'),
    'storm1.png': require('../assets/images/weather-icons/storm1.png'),
    'sunny.png': require('../assets/images/weather-icons/sunny.png'),
    'sunrise.png': require('../assets/images/weather-icons/sunrise.png'),
    'sunset.png': require('../assets/images/weather-icons/sunset.png'),
    'very_hot.png': require('../assets/images/weather-icons/very_hot.png'),
    'very_windy.png': require('../assets/images/weather-icons/very_windy.png'),
    'windy.png': require('../assets/images/weather-icons/windy.png')
  };

  // Preload weather icons
  async preloadWeatherIcons(): Promise<void> {
    console.log('Preloading weather icons...');
    const iconUris = Object.values(this.weatherIconMap);
    console.log('Icon URIs to preload:', iconUris);
    
    // Filter out any null/undefined values
    const validIconUris = iconUris.filter(uri => uri != null);
    console.log('Valid icon URIs:', validIconUris);
    
    if (validIconUris.length === 0) {
      console.warn('No valid icon URIs found for preloading');
      return;
    }
    
    await this.preloadImages(validIconUris);
  }

  // Get optimized weather icon URI
  getWeatherIconUri(iconName: string, size: number = 64): any {
    const baseUri = this.weatherIconMap[iconName];
    if (!baseUri) {
      console.warn(`Weather icon "${iconName}" not found in icon map`);
      return this.weatherIconMap['sunny.png']; // Fallback to sunny icon
    }
    
    // For local images, we can't optimize the URI, but we can return the require result
    // The actual optimization would happen at the Image component level
    return baseUri;
  }
}

// Create singleton instance
export const imageOptimizer = new ImageOptimizer();

// React hook for image optimization
export const useImageOptimizer = () => {
  return {
    preloadImages: imageOptimizer.preloadImages.bind(imageOptimizer),
    preloadImage: imageOptimizer.preloadImage.bind(imageOptimizer),
    getOptimizedImageUri: imageOptimizer.getOptimizedImageUri.bind(imageOptimizer),
    getWeatherIconUri: imageOptimizer.getWeatherIconUri.bind(imageOptimizer),
    preloadWeatherIcons: imageOptimizer.preloadWeatherIcons.bind(imageOptimizer),
    clearCache: imageOptimizer.clearCache.bind(imageOptimizer),
    getCacheStats: imageOptimizer.getCacheStats.bind(imageOptimizer),
  };
};

export default imageOptimizer;
