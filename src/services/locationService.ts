import * as Location from 'expo-location';
import { LocationCoordinates, LocationPermissionStatus, LocationError } from '../types';

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

      console.log('📍 Attempting to get current position...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000, // Increased timeout for physical devices
        distanceInterval: 10,
        // maximumAge is not part of LocationOptions in expo-location@19
      });
      
      console.log('📍 Location obtained:', location.coords);

      const coordinates: LocationCoordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        altitude: location.coords.altitude || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
      };

      this.currentLocation = coordinates;
      return coordinates;
    } catch (error) {
      console.error('Error getting current location:', error);
      
      // Try to get last known location as fallback
      if (this.currentLocation) {
        console.log('📍 Using last known location as fallback:', this.currentLocation);
        return this.currentLocation;
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
