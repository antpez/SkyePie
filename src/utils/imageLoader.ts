import { Image } from 'react-native';
import { performanceMonitor } from './performanceMonitor';

/**
 * Optimized image loading utilities with caching and performance monitoring
 */

interface ImageCache {
  [key: string]: {
    loaded: boolean;
    error: boolean;
    timestamp: number;
  };
}

class ImageLoader {
  private cache: ImageCache = {};
  private preloadedImages: Set<string> = new Set();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Preload images for better performance
   */
  async preloadImages(imageSources: (string | number)[]): Promise<void> {
    return performanceMonitor.measureAsync('ImageLoader.preloadImages', async () => {
      const preloadPromises = imageSources.map((source) => this.preloadImage(source));
      await Promise.allSettled(preloadPromises);
    }, { imageCount: imageSources.length });
  }

  /**
   * Preload a single image
   */
  private async preloadImage(source: string | number): Promise<void> {
    const key = typeof source === 'string' ? source : `local_${source}`;
    
    // Check if already preloaded
    if (this.preloadedImages.has(key)) {
      return;
    }

    // Check cache
    const cached = this.cache[key];
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      if (cached.loaded) {
        this.preloadedImages.add(key);
        return;
      }
      if (cached.error) {
        return; // Don't retry failed images
      }
    }

    try {
      if (typeof source === 'string') {
        await Image.prefetch(source);
      } else {
        // For local assets (numeric), resolve and prefetch the URI if available
        const resolved = Image.resolveAssetSource(source as number);
        if (resolved && resolved.uri) {
          await Image.prefetch(resolved.uri);
        }
      }
      this.cache[key] = {
        loaded: true,
        error: false,
        timestamp: Date.now(),
      };
      this.preloadedImages.add(key);
    } catch (error) {
      this.cache[key] = {
        loaded: false,
        error: true,
        timestamp: Date.now(),
      };
      console.warn(`Failed to preload image: ${key}`, error);
    }
  }

  /**
   * Check if an image is preloaded
   */
  isPreloaded(source: string | number): boolean {
    const key = typeof source === 'string' ? source : `local_${source}`;
    return this.preloadedImages.has(key);
  }

  /**
   * Get image loading status
   */
  getImageStatus(source: string | number): 'loading' | 'loaded' | 'error' | 'unknown' {
    const key = typeof source === 'string' ? source : `local_${source}`;
    
    if (this.preloadedImages.has(key)) {
      return 'loaded';
    }

    const cached = this.cache[key];
    if (cached) {
      if (Date.now() - cached.timestamp > this.CACHE_TTL) {
        return 'unknown';
      }
      return cached.error ? 'error' : cached.loaded ? 'loaded' : 'loading';
    }

    return 'unknown';
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    Object.keys(this.cache).forEach(key => {
      const cached = this.cache[key];
      if (now - cached.timestamp > this.CACHE_TTL) {
        delete this.cache[key];
        this.preloadedImages.delete(key);
      }
    });
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache = {};
    this.preloadedImages.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalImages: number;
    preloadedImages: number;
    loadedImages: number;
    errorImages: number;
  } {
    const totalImages = Object.keys(this.cache).length;
    const preloadedImages = this.preloadedImages.size;
    const loadedImages = Object.values(this.cache).filter(c => c.loaded).length;
    const errorImages = Object.values(this.cache).filter(c => c.error).length;

    return {
      totalImages,
      preloadedImages,
      loadedImages,
      errorImages,
    };
  }
}

// Create singleton instance
export const imageLoader = new ImageLoader();

/**
 * Hook for image loading with performance monitoring
 */
export const useImageLoader = () => {
  return {
    preloadImages: imageLoader.preloadImages.bind(imageLoader),
    isPreloaded: imageLoader.isPreloaded.bind(imageLoader),
    getImageStatus: imageLoader.getImageStatus.bind(imageLoader),
    clearExpiredCache: imageLoader.clearExpiredCache.bind(imageLoader),
    clearCache: imageLoader.clearCache.bind(imageLoader),
    getCacheStats: imageLoader.getCacheStats.bind(imageLoader),
  };
};

/**
 * Preload weather icons for better performance
 */
export const preloadWeatherIcons = async (): Promise<void> => {
  const weatherIcons = [
    require('../assets/images/weather-icons/sunny.png'),
    require('../assets/images/weather-icons/clear_night.png'),
    require('../assets/images/weather-icons/partly_cloudy.png'),
    require('../assets/images/weather-icons/cloudy_night_half.png'),
    require('../assets/images/weather-icons/light_cloudy.png'),
    require('../assets/images/weather-icons/cloudy.png'),
    require('../assets/images/weather-icons/cloudy_night_full.png'),
    require('../assets/images/weather-icons/light_rain.png'),
    require('../assets/images/weather-icons/rain.png'),
    require('../assets/images/weather-icons/heavy_storm.png'),
    require('../assets/images/weather-icons/storm1.png'),
    require('../assets/images/weather-icons/windy.png'),
  ];

  await imageLoader.preloadImages(weatherIcons);
};

export default imageLoader;
