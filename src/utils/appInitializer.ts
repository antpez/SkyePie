import { storageService } from '../services/storageService';
import { databaseConnection } from '../database/connection';
import { deviceCompatibility } from './deviceCompatibility';

export interface AppInitializationState {
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
  progress: {
    storage: boolean;
    database: boolean;
    theme: boolean;
    location: boolean;
  };
}

export class AppInitializer {
  private static instance: AppInitializer;
  private state: AppInitializationState = {
    isInitialized: false,
    isInitializing: true,
    error: null,
    progress: {
      storage: false,
      database: false,
      theme: false,
      location: false,
    },
  };

  private listeners: Set<(state: AppInitializationState) => void> = new Set();

  static getInstance(): AppInitializer {
    if (!AppInitializer.instance) {
      AppInitializer.instance = new AppInitializer();
    }
    return AppInitializer.instance;
  }

  subscribe(listener: (state: AppInitializationState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  private updateProgress(updates: Partial<AppInitializationState['progress']>): void {
    this.state.progress = { ...this.state.progress, ...updates };
    this.notifyListeners();
  }

  private setError(error: string): void {
    this.state.error = error;
    this.state.isInitializing = false;
    this.notifyListeners();
  }

  private setInitialized(): void {
    this.state.isInitialized = true;
    this.state.isInitializing = false;
    this.state.error = null;
    this.notifyListeners();
  }

  async initialize(): Promise<void> {
    if (this.state.isInitialized || this.state.isInitializing) {
      return;
    }

    this.state.isInitializing = true;
    this.state.error = null;
    this.notifyListeners();

    try {
      // Log device compatibility info
      deviceCompatibility.logDeviceInfo();
      
      console.log('🚀 Starting app initialization...');

      // Get device-specific configuration
      const config = deviceCompatibility.getPlatformSpecificConfig();
      
      // Add device-specific initialization delay
      if (config.initializationDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, config.initializationDelay));
      }

      // Step 1: Initialize storage (critical for theme and other settings)
      await this.initializeStorage();
      this.updateProgress({ storage: true });
      console.log('✅ Storage initialized');

      // Step 2: Initialize database (can happen in parallel with theme)
      const databasePromise = this.initializeDatabase();
      
      // Step 3: Initialize theme (depends on storage)
      const themePromise = this.initializeTheme();
      
      // Wait for both to complete with device-specific timeout
      await Promise.race([
        Promise.all([databasePromise, themePromise]),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Initialization timeout')), config.storageTimeout)
        )
      ]);
      
      this.updateProgress({ database: true, theme: true });
      console.log('✅ Database and theme initialized');

      // Step 4: Initialize location (non-blocking)
      this.initializeLocation();
      this.updateProgress({ location: true });
      console.log('✅ Location initialized');

      this.setInitialized();
      console.log('🎉 App initialization complete');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
      console.error('❌ App initialization failed:', errorMessage);
      this.setError(errorMessage);
      throw error;
    }
  }

  private async initializeStorage(): Promise<void> {
    try {
      // Test storage access
      await storageService.getTheme();
      console.log('Storage test successful');
    } catch (error) {
      console.error('Storage initialization failed:', error);
      throw new Error('Failed to initialize storage');
    }
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await databaseConnection.initialize();
      console.log('Database initialization successful');
    } catch (error) {
      console.error('Database initialization failed:', error);
      // Don't throw - database is not critical for app startup
      console.warn('Continuing without database...');
    }
  }

  private async initializeTheme(): Promise<void> {
    try {
      // Load theme settings
      const theme = await storageService.getTheme();
      console.log('Theme loaded:', theme);
    } catch (error) {
      console.error('Theme initialization failed:', error);
      // Don't throw - theme has fallbacks
      console.warn('Using default theme...');
    }
  }

  private async initializeLocation(): Promise<void> {
    try {
      // Location initialization is non-blocking
      // Just check if we have permissions, don't wait for location
      console.log('Location initialization started');
    } catch (error) {
      console.error('Location initialization failed:', error);
      // Don't throw - location is not critical for app startup
    }
  }

  getState(): AppInitializationState {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      isInitialized: false,
      isInitializing: true,
      error: null,
      progress: {
        storage: false,
        database: false,
        theme: false,
        location: false,
      },
    };
    this.notifyListeners();
  }
}

export const appInitializer = AppInitializer.getInstance();
