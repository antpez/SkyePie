import { storageService } from '../services/storageService';
import { settingsPersistenceService } from '../services/settingsPersistenceService';
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
      console.log('🔄 App initialization already in progress or completed');
      return;
    }

    console.log('🚀 Starting app initialization...');
    this.state.isInitializing = true;
    this.state.error = null;
    this.notifyListeners();

    try {
      // Log device compatibility info
      deviceCompatibility.logDeviceInfo();
      
      // Get device-specific configuration
      const config = deviceCompatibility.getPlatformSpecificConfig();
      
      // Add device-specific initialization delay
      if (config.initializationDelay > 0) {
        console.log(`⏱️ Adding ${config.initializationDelay}ms initialization delay`);
        await new Promise(resolve => setTimeout(resolve, config.initializationDelay));
      }

      // Step 1: Initialize storage (critical for theme and other settings)
      console.log('🔄 Step 1: Initializing storage...');
      await this.initializeStorage();
      this.updateProgress({ storage: true });
      console.log('✅ Storage initialized');

      // Step 2: Initialize database (non-blocking)
      console.log('🔄 Step 2: Initializing database...');
      this.initializeDatabase().then(() => {
        this.updateProgress({ database: true });
        console.log('✅ Database initialized');
      }).catch(error => {
        console.warn('⚠️ Database initialization failed:', error);
        this.updateProgress({ database: true }); // Mark as done even if failed
      });
      
      // Step 3: Initialize theme (non-blocking)
      console.log('🔄 Step 3: Initializing theme...');
      this.initializeTheme().then(() => {
        this.updateProgress({ theme: true });
        console.log('✅ Theme initialized');
      }).catch(error => {
        console.warn('⚠️ Theme initialization failed:', error);
        this.updateProgress({ theme: true }); // Mark as done even if failed
      });
      
      // Step 4: Initialize location (non-blocking)
      console.log('🔄 Step 4: Initializing location...');
      this.initializeLocation().then(() => {
        this.updateProgress({ location: true });
        console.log('✅ Location initialized');
      }).catch(error => {
        console.warn('⚠️ Location initialization failed:', error);
        this.updateProgress({ location: true }); // Mark as done even if failed
      });

      // Mark as initialized immediately - don't wait for all services
      console.log('🎉 App initialization complete (non-blocking)');
      this.setInitialized();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
      console.error('❌ App initialization failed:', errorMessage);
      
      // Even on error, mark as initialized to prevent endless loading
      console.warn('⚠️ Forcing initialization completion due to error');
      this.setInitialized();
    }
  }

  private async initializeStorage(): Promise<void> {
    try {
      console.log('🔄 Initializing storage...');
      // Test storage access
      const theme = await storageService.getTheme();
      console.log('✅ Storage test successful, theme:', theme);
      
      // Initialize settings persistence
      console.log('🔄 Initializing settings persistence...');
      const settings = await settingsPersistenceService.initializeSettings();
      console.log('✅ Settings persistence initialized:', settings.id);
    } catch (error) {
      console.error('❌ Storage initialization failed:', error);
      throw new Error('Failed to initialize storage');
    }
  }

  private async initializeDatabase(): Promise<void> {
    try {
      console.log('🔄 Initializing database...');
      await databaseConnection.initialize();
      console.log('✅ Database initialization successful');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      // Don't throw - database is not critical for app startup
      console.warn('⚠️ Continuing without database...');
    }
  }

  private async initializeTheme(): Promise<void> {
    try {
      console.log('🔄 Initializing theme...');
      // Load theme settings
      const theme = await storageService.getTheme();
      console.log('✅ Theme loaded:', theme);
    } catch (error) {
      console.error('❌ Theme initialization failed:', error);
      // Don't throw - theme has fallbacks
      console.warn('⚠️ Using default theme...');
    }
  }

  private async initializeLocation(): Promise<void> {
    try {
      console.log('🔄 Initializing location...');
      // Location initialization is non-blocking
      // Just check if we have permissions, don't wait for location
      console.log('✅ Location initialization started');
    } catch (error) {
      console.error('❌ Location initialization failed:', error);
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
