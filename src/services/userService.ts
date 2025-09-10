import { databaseConnection } from '../database';
import { generateId } from '../utils/helpers';
import { Platform } from 'react-native';

// Wait for database to be ready
const waitForDatabase = async (): Promise<void> => {
  let attempts = 0;
  const maxAttempts = 50; // 5 seconds max wait
  
  while (attempts < maxAttempts) {
    if (databaseConnection.getDatabase()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  
  throw new Error('Database initialization timeout');
};

export interface User {
  id: string;
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
  preferences: Record<string, any>;
  isActive: boolean;
}

export class UserService {
  private static instance: UserService;
  private currentUser: User | null = null;

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async getCurrentUser(): Promise<User> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      // Wait for database to be ready
      await waitForDatabase();
      
      const db = databaseConnection.getDatabase();
      if (!db) {
        throw new Error('Database not initialized');
      }

      // Get or create device ID
      const deviceId = await this.getDeviceId();

      // Try to find existing user
      const existingUser = await db.getFirstAsync<{
        id: string;
        device_id: string;
        created_at: string;
        updated_at: string;
        last_active: string;
        preferences: string;
        is_active: number;
      }>(
        `SELECT * FROM users WHERE device_id = ? AND is_active = 1`,
        [deviceId]
      );

      if (existingUser) {
        this.currentUser = {
          id: existingUser.id,
          deviceId: existingUser.device_id,
          createdAt: new Date(existingUser.created_at),
          updatedAt: new Date(existingUser.updated_at),
          lastActive: new Date(existingUser.last_active),
          preferences: JSON.parse(existingUser.preferences),
          isActive: Boolean(existingUser.is_active),
        };

        // Update last active
        await this.updateLastActive();
        return this.currentUser;
      }

      // Create new user
      const userId = generateId();
      const now = new Date().toISOString();

      await db.runAsync(
        `INSERT INTO users 
         (id, device_id, created_at, updated_at, last_active, preferences, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, deviceId, now, now, now, '{}', 1]
      );

      this.currentUser = {
        id: userId,
        deviceId,
        createdAt: new Date(now),
        updatedAt: new Date(now),
        lastActive: new Date(now),
        preferences: {},
        isActive: true,
      };

      return this.currentUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }

  async updateLastActive(): Promise<void> {
    if (!this.currentUser) return;

    try {
      const db = databaseConnection.getDatabase();
      if (!db) return;

      const now = new Date().toISOString();
      await db.runAsync(
        `UPDATE users SET last_active = ?, updated_at = ? WHERE id = ?`,
        [now, now, this.currentUser.id]
      );

      this.currentUser.lastActive = new Date(now);
      this.currentUser.updatedAt = new Date(now);
    } catch (error) {
      console.error('Error updating last active:', error);
    }
  }

  async updatePreferences(preferences: Record<string, any>): Promise<void> {
    if (!this.currentUser) return;

    try {
      const db = databaseConnection.getDatabase();
      if (!db) return;

      const now = new Date().toISOString();
      await db.runAsync(
        `UPDATE users SET preferences = ?, updated_at = ? WHERE id = ?`,
        [JSON.stringify(preferences), now, this.currentUser.id]
      );

      this.currentUser.preferences = preferences;
      this.currentUser.updatedAt = new Date(now);
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  async getPreferences(): Promise<Record<string, any>> {
    const user = await this.getCurrentUser();
    return user.preferences;
  }

  private async getDeviceId(): Promise<string> {
    try {
      // Use AsyncStorage to store a persistent device ID
      const { storageService } = await import('./storageService');
      let deviceId = await storageService.getItem<string>('device_id');
      
      if (!deviceId) {
        // Generate a unique device ID based on platform and timestamp
        const platformPrefix = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
        deviceId = `${platformPrefix}_${generateId()}`;
        await storageService.setItem('device_id', deviceId);
      }

      return deviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      // Ultimate fallback - generate a new ID each time (not ideal but functional)
      const platformPrefix = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
      return `${platformPrefix}_${generateId()}`;
    }
  }

  async clearUserData(): Promise<void> {
    try {
      const db = databaseConnection.getDatabase();
      if (!db) return;

      if (this.currentUser) {
        // Mark user as inactive instead of deleting
        await db.runAsync(
          `UPDATE users SET is_active = 0, updated_at = ? WHERE id = ?`,
          [new Date().toISOString(), this.currentUser.id]
        );
      }

      this.currentUser = null;
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  }
}

export const userService = UserService.getInstance();
