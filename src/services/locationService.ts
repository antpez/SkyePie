import * as Location from 'expo-location';
import { LocationCoordinates, LocationPermissionStatus, LocationError } from '../types';
import { networkAwareConfig } from '../utils/networkAwareConfig';
import { networkStatusMonitor } from '../utils/networkStatus';

export class LocationService {
  private static instance: LocationService;
  private currentLocation: LocationCoordinates | null = null;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestLocationPermission(): Promise<LocationPermissionStatus> {
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain: canAskAgain,
        status: status as 'granted' | 'denied' | 'undetermined',
      };
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied',
      };
    }
  }

  async getCurrentLocation(): Promise<LocationCoordinates> {
    try {
      // First check if we already have permission
      let { status } = await Location.getForegroundPermissionsAsync();
      
      console.log('📍 Current permission status:', status);
      
      // If permission is not granted, try to request it
      if (status !== 'granted') {
        console.log('📍 Location permission not granted, requesting permission...');
        const permissionResult = await this.requestLocationPermission();
        
        console.log('📍 Permission request result:', permissionResult);
        
        if (!permissionResult.granted) {
          throw new Error('Location permission denied by user');
        }
        
        // Permission is now granted, we can proceed
      }

      // Ensure device location services are enabled
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        throw { code: 'E_LOCATION_SERVICES_DISABLED', message: 'Location services disabled' };
      }

      console.log('📍 Attempting to get current position...');

      // Quick warm start: try last known position first
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown?.coords) {
        this.currentLocation = {
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
          accuracy: lastKnown.coords.accuracy || undefined,
          altitude: lastKnown.coords.altitude || undefined,
          heading: lastKnown.coords.heading || undefined,
          speed: lastKnown.coords.speed || undefined,
        };
      }

      // Get network-aware configuration for optimal location accuracy
      const networkStatus = networkStatusMonitor.getCurrentStatus();
      const locationConfig = networkAwareConfig.getLocationConfigForNetwork(networkStatus);
      
      console.log('📍 Using network-aware location config:', locationConfig);

      const timeoutMs = locationConfig.timeout;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject({ code: 'E_LOCATION_TIMEOUT', message: 'Timed out getting location' }), timeoutMs)
      );

      // Map accuracy string to Location.Accuracy enum
      const getAccuracyEnum = (accuracy: string) => {
        switch (accuracy) {
          case 'highest': return Location.Accuracy.Highest;
          case 'high': return Location.Accuracy.High;
          case 'balanced': return Location.Accuracy.Balanced;
          case 'low': return Location.Accuracy.Low;
          default: return Location.Accuracy.High;
        }
      };

      // Try network-optimized accuracy first, then fallback to progressively less accurate options
      const liveLocation = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: getAccuracyEnum(locationConfig.accuracy),
          timeInterval: locationConfig.timeInterval,
          distanceInterval: locationConfig.distanceInterval,
          mayShowUserSettingsDialog: true,
        }),
        timeoutPromise,
      ] as const).catch(async (err) => {
        console.warn('📍 Primary location accuracy failed, trying fallback:', err);
        // Fallback to high accuracy
        return await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
            timeInterval: Math.min(locationConfig.timeInterval * 0.8, 10000),
            distanceInterval: Math.max(locationConfig.distanceInterval * 2, 10),
            mayShowUserSettingsDialog: true,
          }),
          timeoutPromise,
        ] as const).catch(async (err2) => {
          console.warn('📍 High accuracy location failed, falling back to balanced:', err2);
          // Final fallback to balanced accuracy
          return await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeInterval: Math.min(locationConfig.timeInterval * 0.6, 8000),
            distanceInterval: Math.max(locationConfig.distanceInterval * 3, 25),
            mayShowUserSettingsDialog: true,
          });
        });
      });

      const location = liveLocation as Location.LocationObject;
      
      console.log('📍 Location obtained:', location.coords);

      // Validate location accuracy and quality
      const accuracy = location.coords.accuracy || 0;
      const maxAcceptableAccuracy = 100; // meters - reject locations less accurate than 100m
      
      if (accuracy > maxAcceptableAccuracy) {
        console.warn(`📍 Location accuracy (${accuracy}m) exceeds acceptable threshold (${maxAcceptableAccuracy}m)`);
        // Still use the location but log the warning
      }

      const coordinates: LocationCoordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        altitude: location.coords.altitude || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
      };

      // Store the most accurate location we've obtained
      if (!this.currentLocation || (this.currentLocation.accuracy && accuracy < this.currentLocation.accuracy)) {
        this.currentLocation = coordinates;
        console.log('📍 Updated to more accurate location:', coordinates);
      } else {
        this.currentLocation = coordinates;
      }
      
      return coordinates;
    } catch (error) {
      console.error('Error getting current location:', error);
      
      // Try to get last known location as fallback
      if (this.currentLocation) {
        console.log('📍 Using last known location as fallback:', this.currentLocation);
        return this.currentLocation;
      }
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown?.coords) {
        const coordinates: LocationCoordinates = {
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
          accuracy: lastKnown.coords.accuracy || undefined,
          altitude: lastKnown.coords.altitude || undefined,
          heading: lastKnown.coords.heading || undefined,
          speed: lastKnown.coords.speed || undefined,
        };
        this.currentLocation = coordinates;
        return coordinates;
      }
      
      throw this.handleLocationError(error);
    }
  }

  async watchLocation(
    callback: (location: LocationCoordinates) => void,
    errorCallback?: (error: LocationError) => void
  ): Promise<Location.LocationSubscription> {
    try {
      // First check if we already have permission
      let { status } = await Location.getForegroundPermissionsAsync();
      
      // If permission is not granted, try to request it
      if (status !== 'granted') {
        // if (__DEV__) {
        //   console.log('Location permission not granted for watching, requesting permission...');
        // }
        const permissionResult = await this.requestLocationPermission();
        
        if (!permissionResult.granted) {
          throw new Error('Location permission denied by user');
        }
        
        // Permission is now granted, we can proceed
      }

      return await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000, // 30 seconds
          distanceInterval: 100, // 100 meters
        },
        (location) => {
          const coordinates: LocationCoordinates = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
            altitude: location.coords.altitude || undefined,
            heading: location.coords.heading || undefined,
            speed: location.coords.speed || undefined,
          };
          
          this.currentLocation = coordinates;
          callback(coordinates);
        }
      );
    } catch (error) {
      console.error('Error watching location:', error);
      const locationError = this.handleLocationError(error);
      if (errorCallback) {
        errorCallback(locationError);
      }
      throw locationError;
    }
  }

  getLastKnownLocation(): LocationCoordinates | null {
    return this.currentLocation;
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        const parts = [];
        
        if (address.city) parts.push(address.city);
        if (address.region) parts.push(address.region);
        if (address.country) parts.push(address.country);
        
        return parts.join(', ');
      }

      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  }

  private handleLocationError(error: any): LocationError {
    if (error.code) {
      switch (error.code) {
        case 'E_LOCATION_SERVICES_DISABLED':
          return {
            code: error.code,
            message: 'Location services are disabled. Please enable them in settings.',
            type: 'service',
          };
        case 'E_LOCATION_UNAVAILABLE':
          return {
            code: error.code,
            message: 'Location is currently unavailable. Please try again later.',
            type: 'service',
          };
        case 'E_LOCATION_TIMEOUT':
          return {
            code: error.code,
            message: 'Location request timed out. Please try again.',
            type: 'timeout',
          };
        case 'E_LOCATION_PERMISSION_DENIED':
          return {
            code: error.code,
            message: 'Location permission denied. Please enable location access.',
            type: 'permission',
          };
        default:
          return {
            code: error.code || 'UNKNOWN',
            message: error.message || 'An unknown location error occurred.',
            type: 'unknown',
          };
      }
    }

    return {
      code: 'UNKNOWN',
      message: error.message || 'An unknown error occurred.',
      type: 'unknown',
    };
  }
}

export const locationService = LocationService.getInstance();
