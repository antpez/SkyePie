import { databaseConnection } from '../connection';
import { Location, LocationSearchResult } from '../../types';
import { generateId } from '../../utils/helpers';

export class LocationRepository {
  private get db() {
    const db = databaseConnection.getDatabase();
    if (!db) {
      throw new Error('Database not initialized');
    }
    return db;
  }

  async saveLocation(location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<Location> {
    try {
      const id = generateId();
      const now = new Date().toISOString();
      
      await this.db.runAsync(
        `INSERT OR REPLACE INTO locations 
         (id, user_id, name, country, state, latitude, longitude, timezone, 
          is_current, is_favorite, search_count, last_searched, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          location.userId || null,
          location.name,
          location.country,
          location.state || null,
          location.latitude,
          location.longitude,
          location.timezone || null,
          location.isCurrent ? 1 : 0,
          location.isFavorite ? 1 : 0,
          location.searchCount,
          location.lastSearched?.toISOString() || null,
          now,
          now,
        ]
      );

      return {
        ...location,
        id,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      };
    } catch (error) {
      console.error('Error saving location:', error);
      throw error;
    }
  }

  async getLocation(id: string): Promise<Location | null> {
    try {
      const result = await this.db.getFirstAsync<{
        id: string;
        user_id: string | null;
        name: string;
        country: string;
        state: string | null;
        latitude: number;
        longitude: number;
        timezone: string | null;
        is_current: number;
        is_favorite: number;
        search_count: number;
        last_searched: string | null;
        created_at: string;
        updated_at: string;
      }>(
        `SELECT * FROM locations WHERE id = ?`,
        [id]
      );

      if (!result) return null;

      return this.mapRowToLocation(result);
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  async getCurrentLocation(userId: string): Promise<Location | null> {
    try {
      const result = await this.db.getFirstAsync<{
        id: string;
        user_id: string | null;
        name: string;
        country: string;
        state: string | null;
        latitude: number;
        longitude: number;
        timezone: string | null;
        is_current: number;
        is_favorite: number;
        search_count: number;
        last_searched: string | null;
        created_at: string;
        updated_at: string;
      }>(
        `SELECT * FROM locations WHERE user_id = ? AND is_current = 1 LIMIT 1`,
        [userId]
      );

      if (!result) return null;

      return this.mapRowToLocation(result);
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  async getFavoriteLocations(userId: string): Promise<Location[]> {
    try {
      const results = await this.db.getAllAsync<{
        id: string;
        user_id: string | null;
        name: string;
        country: string;
        state: string | null;
        latitude: number;
        longitude: number;
        timezone: string | null;
        is_current: number;
        is_favorite: number;
        search_count: number;
        last_searched: string | null;
        created_at: string;
        updated_at: string;
      }>(
        `SELECT * FROM locations WHERE user_id = ? AND is_favorite = 1 ORDER BY 
         CASE WHEN last_searched IS NULL THEN 1 ELSE 0 END, 
         last_searched DESC, 
         created_at DESC`,
        [userId]
      );

      // console.log('Raw favorite locations from DB:', results.map(r => ({
      //   name: r.name,
      //   last_searched: r.last_searched,
      //   created_at: r.created_at
      // })));

      return results.map(this.mapRowToLocation);
    } catch (error) {
      console.error('Error getting favorite locations:', error);
      return [];
    }
  }

  async updateLocation(id: string, updates: Partial<Location>): Promise<void> {
    try {
      const setClause = [];
      const values = [];

      if (updates.isCurrent !== undefined) {
        setClause.push('is_current = ?');
        values.push(updates.isCurrent ? 1 : 0);
      }

      if (updates.isFavorite !== undefined) {
        setClause.push('is_favorite = ?');
        values.push(updates.isFavorite ? 1 : 0);
      }

      if (updates.searchCount !== undefined) {
        setClause.push('search_count = ?');
        values.push(updates.searchCount);
      }

      if (updates.lastSearched !== undefined) {
        setClause.push('last_searched = ?');
        values.push(updates.lastSearched.toISOString());
        // console.log('Updating lastSearched for location', id, 'to', updates.lastSearched.toISOString());
      }

      if (setClause.length === 0) return;

      setClause.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(id);

      const sql = `UPDATE locations SET ${setClause.join(', ')} WHERE id = ?`;
      
      // if (__DEV__) {
      //   console.log('Updating location:', id, 'with fields:', Object.keys(updates));
      // }

      const result = await this.db.runAsync(sql, values);
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  async deleteLocation(id: string): Promise<void> {
    try {
      await this.db.runAsync(`DELETE FROM locations WHERE id = ?`, [id]);
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }

  async searchLocations(query: string, limit: number = 10): Promise<Location[]> {
    try {
      // Sanitize query to prevent potential issues
      const sanitizedQuery = query.trim().replace(/[%_]/g, '\\$&');
      
      const results = await this.db.getAllAsync<{
        id: string;
        user_id: string | null;
        name: string;
        country: string;
        state: string | null;
        latitude: number;
        longitude: number;
        timezone: string | null;
        is_current: number;
        is_favorite: number;
        search_count: number;
        last_searched: string | null;
        created_at: string;
        updated_at: string;
      }>(
        `SELECT * FROM locations 
         WHERE name LIKE ? OR country LIKE ? OR state LIKE ?
         ORDER BY search_count DESC, created_at DESC
         LIMIT ?`,
        [`%${sanitizedQuery}%`, `%${sanitizedQuery}%`, `%${sanitizedQuery}%`, limit]
      );

      return results.map(this.mapRowToLocation);
    } catch (error) {
      console.error('Error searching locations:', error);
      return [];
    }
  }

  private mapRowToLocation(row: any): Location {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      country: row.country,
      state: row.state,
      latitude: row.latitude,
      longitude: row.longitude,
      timezone: row.timezone,
      isCurrent: Boolean(row.is_current),
      isFavorite: Boolean(row.is_favorite),
      searchCount: row.search_count,
      lastSearched: row.last_searched ? new Date(row.last_searched) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

export const locationRepository = new LocationRepository();
