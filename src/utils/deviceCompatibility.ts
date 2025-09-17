import { Platform } from 'react-native';
import Constants from 'expo-constants';

export interface DeviceInfo {
  platform: string;
  isSimulator: boolean;
  isPhysicalDevice: boolean;
  deviceName?: string;
  osVersion?: string;
}

export class DeviceCompatibility {
  private static instance: DeviceCompatibility;
  private deviceInfo: DeviceInfo;

  constructor() {
    this.deviceInfo = this.detectDeviceInfo();
  }

  static getInstance(): DeviceCompatibility {
    if (!DeviceCompatibility.instance) {
      DeviceCompatibility.instance = new DeviceCompatibility();
    }
    return DeviceCompatibility.instance;
  }

  private detectDeviceInfo(): DeviceInfo {
    const isSimulator = __DEV__ && (
      Constants.appOwnership === 'expo' || 
      Constants.executionEnvironment === 'storeClient' ||
      // Additional simulator detection
      (Platform.OS === 'ios' && Constants.deviceName?.includes('Simulator')) ||
      (Platform.OS === 'android' && Constants.deviceName?.includes('emulator'))
    );

    return {
      platform: Platform.OS,
      isSimulator: !!isSimulator,
      isPhysicalDevice: !isSimulator,
      deviceName: Constants.deviceName,
      osVersion: Platform.Version?.toString(),
    };
  }

  getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }

  isPhysicalDevice(): boolean {
    return this.deviceInfo.isPhysicalDevice;
  }

  isSimulator(): boolean {
    return this.deviceInfo.isSimulator;
  }

  getPlatformSpecificConfig() {
    const isPhysical = this.isPhysicalDevice();
    
    return {
      // Storage timing - physical devices are slower
      storageTimeout: isPhysical ? 5000 : 1000,
      
      // Network timeout - physical devices may have slower networks
      networkTimeout: isPhysical ? 10000 : 5000,
      
      // Location accuracy - physical devices need more accurate location
      locationAccuracy: isPhysical ? 'high' : 'balanced',
      
      // Initialization delays - physical devices need more time
      initializationDelay: isPhysical ? 200 : 50,
      
      // Retry attempts - physical devices may need more retries
      retryAttempts: isPhysical ? 3 : 2,
    };
  }

  getDebugInfo(): string {
    const info = this.getDeviceInfo();
    const config = this.getPlatformSpecificConfig();
    
    return `
Device Compatibility Info:
- Platform: ${info.platform}
- Device Type: ${info.isPhysicalDevice ? 'Physical Device' : 'Simulator'}
- Device Name: ${info.deviceName || 'Unknown'}
- OS Version: ${info.osVersion || 'Unknown'}
- Storage Timeout: ${config.storageTimeout}ms
- Network Timeout: ${config.networkTimeout}ms
- Location Accuracy: ${config.locationAccuracy}
- Init Delay: ${config.initializationDelay}ms
- Retry Attempts: ${config.retryAttempts}
    `.trim();
  }

  logDeviceInfo(): void {
    console.log('📱 Device Compatibility:', this.getDebugInfo());
  }
}

export const deviceCompatibility = DeviceCompatibility.getInstance();
