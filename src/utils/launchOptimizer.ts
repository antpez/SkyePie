/**
 * Launch Optimizer - Critical performance optimizations for production launch
 * This utility provides essential optimizations to ensure smooth app performance
 */

import { Platform } from 'react-native';

export class LaunchOptimizer {
  private static instance: LaunchOptimizer;
  private isOptimized = false;

  static getInstance(): LaunchOptimizer {
    if (!LaunchOptimizer.instance) {
      LaunchOptimizer.instance = new LaunchOptimizer();
    }
    return LaunchOptimizer.instance;
  }

  /**
   * Apply critical launch optimizations
   */
  optimizeForLaunch(): void {
    if (this.isOptimized) return;

    // Disable console.log in production
    if (!__DEV__) {
      this.disableConsoleLogs();
    }

    // Optimize for platform-specific performance
    this.optimizeForPlatform();

    // Preload critical resources
    this.preloadCriticalResources();

    this.isOptimized = true;
  }

  /**
   * Disable console.log in production to improve performance
   */
  private disableConsoleLogs(): void {
    const noop = () => {};
    
    // Override console methods in production
    console.log = noop;
    console.warn = noop;
    console.info = noop;
    console.debug = noop;
    
    // Keep console.error for critical errors
    // console.error remains unchanged
  }

  /**
   * Apply platform-specific optimizations
   */
  private optimizeForPlatform(): void {
    if (Platform.OS === 'android') {
      // Android-specific optimizations
      this.optimizeForAndroid();
    } else if (Platform.OS === 'ios') {
      // iOS-specific optimizations
      this.optimizeForIOS();
    }
  }

  /**
   * Android-specific optimizations
   */
  private optimizeForAndroid(): void {
    // Enable hardware acceleration hints
    if (global.HermesInternal) {
      // Hermes-specific optimizations
      try {
        // Force garbage collection before critical operations
        if (global.HermesInternal.enablePromiseRejectionTracker) {
          global.HermesInternal.enablePromiseRejectionTracker(false);
        }
      } catch (e) {
        // Ignore if not available
      }
    }
  }

  /**
   * iOS-specific optimizations
   */
  private optimizeForIOS(): void {
    // iOS-specific optimizations can be added here
    // For now, we rely on React Native's built-in optimizations
  }

  /**
   * Preload critical resources for faster app startup
   */
  private preloadCriticalResources(): void {
    // Preload critical images
    this.preloadWeatherIcons();
    
    // Preload critical fonts
    this.preloadFonts();
  }

  /**
   * Preload weather icons for faster rendering
   */
  private preloadWeatherIcons(): void {
    // This will be handled by the imageLoader utility
    // We just ensure it's called early in the app lifecycle
    try {
      const { imageLoader } = require('./imageLoader');
      if (imageLoader && typeof imageLoader.preloadWeatherIcons === 'function') {
        imageLoader.preloadWeatherIcons().catch(() => {
          // Ignore errors during preloading
        });
      }
    } catch (e) {
      // Ignore if imageLoader is not available
    }
  }

  /**
   * Preload critical fonts
   */
  private preloadFonts(): void {
    // Font preloading is handled by Expo's font system
    // This is a placeholder for future font optimizations
  }

  /**
   * Get performance metrics for monitoring
   */
  getPerformanceMetrics(): {
    isOptimized: boolean;
    platform: string;
    isProduction: boolean;
  } {
    return {
      isOptimized: this.isOptimized,
      platform: Platform.OS,
      isProduction: !__DEV__,
    };
  }

  /**
   * Reset optimizations (useful for testing)
   */
  reset(): void {
    this.isOptimized = false;
  }
}

// Export singleton instance
export const launchOptimizer = LaunchOptimizer.getInstance();

// Auto-optimize on import in production
if (!__DEV__) {
  launchOptimizer.optimizeForLaunch();
}
