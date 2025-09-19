import { NetworkStatus } from '../types/networkErrors';

export interface NetworkAwareConfig {
  timeout: number;
  retryAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

/**
 * Network-aware configuration utility that adjusts timeouts and retry settings
 * based on current network conditions for optimal data fetching accuracy
 */
export class NetworkAwareConfigManager {
  private static instance: NetworkAwareConfigManager;

  static getInstance(): NetworkAwareConfigManager {
    if (!NetworkAwareConfigManager.instance) {
      NetworkAwareConfigManager.instance = new NetworkAwareConfigManager();
    }
    return NetworkAwareConfigManager.instance;
  }

  /**
   * Get configuration optimized for current network conditions
   */
  getConfigForNetwork(networkStatus: NetworkStatus): NetworkAwareConfig {
    const { isOnline, isSlowConnection, connectionType } = networkStatus;

    // Base configuration
    let config: NetworkAwareConfig = {
      timeout: 8000,
      retryAttempts: 3,
      baseDelay: 500,
      maxDelay: 15000,
      backoffMultiplier: 1.5,
    };

    if (!isOnline) {
      // Offline - use cached data only
      return {
        timeout: 1000,
        retryAttempts: 0,
        baseDelay: 0,
        maxDelay: 0,
        backoffMultiplier: 1,
      };
    }

    // Adjust based on connection type
    switch (connectionType) {
      case 'wifi':
        // WiFi - can handle higher timeouts and more retries
        config.timeout = 10000;
        config.retryAttempts = 4;
        config.baseDelay = 300;
        config.maxDelay = 20000;
        break;
      
      case 'cellular':
        // Cellular - moderate settings
        config.timeout = 8000;
        config.retryAttempts = 3;
        config.baseDelay = 500;
        config.maxDelay = 15000;
        break;
      
      case 'ethernet':
        // Ethernet - best performance
        config.timeout = 12000;
        config.retryAttempts = 5;
        config.baseDelay = 200;
        config.maxDelay = 25000;
        break;
      
      default:
        // Unknown connection - conservative settings
        config.timeout = 6000;
        config.retryAttempts = 2;
        config.baseDelay = 1000;
        config.maxDelay = 10000;
    }

    // Adjust for slow connections
    if (isSlowConnection) {
      config.timeout = Math.min(config.timeout * 1.5, 15000);
      config.retryAttempts = Math.max(config.retryAttempts - 1, 2);
      config.baseDelay = Math.min(config.baseDelay * 2, 2000);
      config.maxDelay = Math.min(config.maxDelay * 1.2, 20000);
    }

    return config;
  }

  /**
   * Get location-specific configuration based on network conditions
   */
  getLocationConfigForNetwork(networkStatus: NetworkStatus): {
    timeout: number;
    accuracy: 'highest' | 'high' | 'balanced' | 'low';
    timeInterval: number;
    distanceInterval: number;
  } {
    const { isOnline, isSlowConnection, connectionType } = networkStatus;

    if (!isOnline) {
      return {
        timeout: 5000,
        accuracy: 'balanced',
        timeInterval: 5000,
        distanceInterval: 50,
      };
    }

    let config = {
      timeout: 20000,
      accuracy: 'highest' as const,
      timeInterval: 15000,
      distanceInterval: 5,
    };

    // Adjust based on connection quality
    if (isSlowConnection || connectionType === 'cellular') {
      config.timeout = 15000;
      config.accuracy = 'high';
      config.timeInterval = 10000;
      config.distanceInterval = 15;
    } else if (connectionType === 'wifi') {
      config.timeout = 25000;
      config.accuracy = 'highest';
      config.timeInterval = 20000;
      config.distanceInterval = 3;
    }

    return config;
  }

  /**
   * Get weather API configuration based on network conditions
   */
  getWeatherConfigForNetwork(networkStatus: NetworkStatus): {
    timeout: number;
    retryAttempts: number;
    cacheStrategy: 'aggressive' | 'balanced' | 'minimal';
  } {
    const { isOnline, isSlowConnection, connectionType } = networkStatus;

    if (!isOnline) {
      return {
        timeout: 1000,
        retryAttempts: 0,
        cacheStrategy: 'aggressive',
      };
    }

    let config = {
      timeout: 8000,
      retryAttempts: 3,
      cacheStrategy: 'balanced' as const,
    };

    if (isSlowConnection) {
      config.timeout = 12000;
      config.retryAttempts = 2;
      config.cacheStrategy = 'aggressive';
    } else if (connectionType === 'wifi' || connectionType === 'ethernet') {
      config.timeout = 10000;
      config.retryAttempts = 4;
      config.cacheStrategy = 'minimal';
    }

    return config;
  }
}

export const networkAwareConfig = NetworkAwareConfigManager.getInstance();
