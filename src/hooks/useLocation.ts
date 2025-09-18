import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { LocationCoordinates, LocationPermissionStatus, LocationError } from '../types';
import { locationService } from '../services';

export const useLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>({
    granted: false,
    canAskAgain: true,
    status: 'undetermined',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);

  const requestPermission = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const status = await locationService.requestLocationPermission();
      setPermissionStatus(status);
      
      return status;
    } catch (err) {
      const locationError = err as LocationError;
      setError(locationError);
      throw locationError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location);
      
      return location;
    } catch (err) {
      const locationError = err as LocationError;
      setError(locationError);
      throw locationError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const watchLocation = useCallback((
    onLocationUpdate: (location: LocationCoordinates) => void,
    onError?: (error: LocationError) => void
  ) => {
    return locationService.watchLocation(
      (location) => {
        setCurrentLocation(location);
        onLocationUpdate(location);
      },
      (error) => {
        setError(error);
        if (onError) {
          onError(error);
        }
      }
    );
  }, []);

  const getLastKnownLocation = useCallback(() => {
    return locationService.getLastKnownLocation();
  }, []);

  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    try {
      return await locationService.reverseGeocode(latitude, longitude);
    } catch (err) {
      const locationError = err as LocationError;
      setError(locationError);
      throw locationError;
    }
  }, []);

  // Check permission status on mount
  useEffect(() => {
    const checkPermissionStatus = async () => {
      try {
        console.log('🔍 Checking initial permission status...');
        const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
        console.log('🔍 Initial permission status:', status, 'canAskAgain:', canAskAgain);
        
        const permissionStatus: LocationPermissionStatus = {
          granted: status === 'granted',
          canAskAgain: canAskAgain,
          status: status as 'granted' | 'denied' | 'undetermined',
        };
        
        setPermissionStatus(permissionStatus);
      } catch (err) {
        console.error('Error checking permission status:', err);
      }
    };

    checkPermissionStatus();
  }, []);

  return {
    currentLocation,
    permissionStatus,
    isLoading,
    error,
    requestPermission,
    getCurrentLocation,
    watchLocation,
    getLastKnownLocation,
    reverseGeocode,
    clearError: () => setError(null),
  };
};
