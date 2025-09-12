import { Platform } from 'react-native';
import { performanceMonitor } from '../utils/performanceMonitor';

// Platform-specific SQLite import to avoid web bundling issues
let SQLite: any;
if (Platform.OS === 'web') {
  // Mock SQLite for web platform
  SQLite = {
    openDatabaseAsync: () => Promise.resolve(null),
    execAsync: () => Promise.resolve(),
    closeAsync: () => Promise.resolve(),
  };
} else {
  SQLite = require('expo-sqlite');
}

// Type definitions for SQLite
interface SQLiteDatabase {
  execAsync: (sql: string) => Promise<void>;
  closeAsync: () => Promise<void>;
  runAsync: (sql: string, params?: any[]) => Promise<void>;
  getFirstAsync: <T>(sql: string, params?: any[]) => Promise<T | null>;
  getAllAsync: <T>(sql: string, params?: any[]) => Promise<T[]>;
}

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private db: SQLiteDatabase | null = null;

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async initialize(): Promise<void> {
    return performanceMonitor.measureAsync('DatabaseConnection.initialize', async () => {
      try {
        this.db = await SQLite.openDatabaseAsync('skyepie.db');
        await this.createTables();
      } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
      }
    });
  }

  getDatabase(): SQLiteDatabase | null {
    return this.db;
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    // Users table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        device_id TEXT UNIQUE NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_active TEXT DEFAULT CURRENT_TIMESTAMP,
        preferences TEXT DEFAULT '{}',
        is_active INTEGER DEFAULT 1
      );
    `);

    // Locations table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT NOT NULL,
        country TEXT NOT NULL,
        state TEXT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timezone TEXT,
        is_current INTEGER DEFAULT 0,
        is_favorite INTEGER DEFAULT 0,
        search_count INTEGER DEFAULT 0,
        last_searched TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id, latitude, longitude)
      );
    `);

    // Weather cache table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS weather_cache (
        id TEXT PRIMARY KEY,
        location_id TEXT,
        weather_type TEXT NOT NULL,
        data TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES locations (id) ON DELETE CASCADE,
        UNIQUE(location_id, weather_type)
      );
    `);

    // Search history table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS search_history (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        query TEXT NOT NULL,
        location_id TEXT,
        search_type TEXT DEFAULT 'manual',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (location_id) REFERENCES locations (id) ON DELETE SET NULL
      );
    `);

    // User settings table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE,
        temperature_unit TEXT DEFAULT 'celsius',
        wind_speed_unit TEXT DEFAULT 'kmh',
        pressure_unit TEXT DEFAULT 'hpa',
        distance_unit TEXT DEFAULT 'km',
        theme TEXT DEFAULT 'system',
        notifications_enabled INTEGER DEFAULT 1,
        location_accuracy TEXT DEFAULT 'high',
        auto_refresh_interval INTEGER DEFAULT 15,
        show_feels_like INTEGER DEFAULT 1,
        show_humidity INTEGER DEFAULT 1,
        show_wind_speed INTEGER DEFAULT 1,
        show_pressure INTEGER DEFAULT 0,
        show_uv_index INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);

    // Weather alerts table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS weather_alerts (
        id TEXT PRIMARY KEY,
        location_id TEXT,
        alert_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES locations (id) ON DELETE CASCADE
      );
    `);

    // Create indexes
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_locations_user_current 
      ON locations(user_id, is_current) WHERE is_current = 1;
    `);

    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_locations_user_favorites 
      ON locations(user_id, is_favorite) WHERE is_favorite = 1;
    `);

    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_weather_cache_expires 
      ON weather_cache(expires_at);
    `);

    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_search_history_user 
      ON search_history(user_id);
    `);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export const databaseConnection = DatabaseConnection.getInstance();
