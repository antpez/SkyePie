import { useState, useEffect, useCallback } from 'react';
import { NetworkStatus } from '../types/networkErrors';
import { networkStatusMonitor } from '../utils/networkStatus';

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(() => 
    networkStatusMonitor.getCurrentStatus()
  );
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeNetworkMonitoring = async () => {
      try {
        await networkStatusMonitor.initialize();
        if (isMounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Failed to initialize network monitoring:', error);
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    initializeNetworkMonitoring();

    // Subscribe to network status changes
    const unsubscribe = networkStatusMonitor.addListener((status) => {
      if (isMounted) {
        setNetworkStatus(status);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const refreshNetworkStatus = useCallback(async () => {
    try {
      const status = await networkStatusMonitor.refresh();
      setNetworkStatus(status);
      return status;
    } catch (error) {
      console.error('Failed to refresh network status:', error);
      return networkStatus;
    }
  }, [networkStatus]);

  const isOnline = networkStatus.isOnline;
  const isSlowConnection = networkStatus.isSlowConnection;
  const connectionType = networkStatus.connectionType;

  return {
    networkStatus,
    isOnline,
    isSlowConnection,
    connectionType,
    isInitialized,
    refreshNetworkStatus,
  };
};
