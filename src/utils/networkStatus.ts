import NetInfo from '@react-native-community/netinfo';
import { NetworkStatus } from '../types/networkErrors';

export class NetworkStatusMonitor {
  private static instance: NetworkStatusMonitor;
  private currentStatus: NetworkStatus;
  private listeners: Set<(status: NetworkStatus) => void> = new Set();
  private unsubscribe?: () => void;

  constructor() {
    this.currentStatus = {
      isOnline: true,
      connectionType: 'unknown',
      isSlowConnection: false,
      lastChecked: Date.now(),
    };
  }

  static getInstance(): NetworkStatusMonitor {
    if (!NetworkStatusMonitor.instance) {
      NetworkStatusMonitor.instance = new NetworkStatusMonitor();
    }
    return NetworkStatusMonitor.instance;
  }

  /**
   * Initialize network monitoring
   */
  async initialize(): Promise<void> {
    try {
      // Get initial network state
      const state = await NetInfo.fetch();
      this.updateStatus(state);

      // Subscribe to network state changes
      this.unsubscribe = NetInfo.addEventListener(state => {
        this.updateStatus(state);
      });
    } catch (error) {
      console.error('Failed to initialize network monitoring:', error);
    }
  }

  /**
   * Update network status based on NetInfo state
   */
  private updateStatus(state: any): void {
    const isOnline = state.isConnected && state.isInternetReachable;
    const connectionType = this.mapConnectionType(state.type);
    const isSlowConnection = this.isSlowConnection(state);

    const newStatus: NetworkStatus = {
      isOnline: isOnline ?? false,
      connectionType,
      isSlowConnection,
      lastChecked: Date.now(),
    };

    const statusChanged = 
      this.currentStatus.isOnline !== newStatus.isOnline ||
      this.currentStatus.connectionType !== newStatus.connectionType ||
      this.currentStatus.isSlowConnection !== newStatus.isSlowConnection;

    this.currentStatus = newStatus;

    if (statusChanged) {
      this.notifyListeners();
    }
  }

  /**
   * Map NetInfo connection type to our type
   */
  private mapConnectionType(type: string): 'wifi' | 'cellular' | 'ethernet' | 'unknown' {
    switch (type) {
      case 'wifi':
        return 'wifi';
      case 'cellular':
        return 'cellular';
      case 'ethernet':
        return 'ethernet';
      default:
        return 'unknown';
    }
  }

  /**
   * Determine if connection is slow based on NetInfo details
   */
  private isSlowConnection(state: any): boolean {
    if (!state.details) return false;

    // Check for cellular connection with slow speed
    if (state.type === 'cellular' && state.details.cellularGeneration) {
      const generation = state.details.cellularGeneration;
      return generation === '2g' || generation === '3g';
    }

    // Check for WiFi with slow speed (if available)
    if (state.type === 'wifi' && state.details.strength) {
      return state.details.strength < -70; // Weak signal
    }

    return false;
  }

  /**
   * Get current network status
   */
  getCurrentStatus(): NetworkStatus {
    return { ...this.currentStatus };
  }

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    return this.currentStatus.isOnline;
  }

  /**
   * Check if connection is slow
   */
  getIsSlowConnection(): boolean {
    return this.currentStatus.isSlowConnection;
  }

  /**
   * Add listener for network status changes
   */
  addListener(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentStatus);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }

  /**
   * Cleanup network monitoring
   */
  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
    this.listeners.clear();
  }

  /**
   * Force refresh network status
   */
  async refresh(): Promise<NetworkStatus> {
    try {
      const state = await NetInfo.fetch();
      this.updateStatus(state);
      return this.getCurrentStatus();
    } catch (error) {
      console.error('Failed to refresh network status:', error);
      return this.getCurrentStatus();
    }
  }
}

export const networkStatusMonitor = NetworkStatusMonitor.getInstance();
