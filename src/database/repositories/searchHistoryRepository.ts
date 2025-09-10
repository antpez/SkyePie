import { databaseConnection } from '../connection';
import { SearchHistoryItem } from '../../types';
import { generateId } from '../../utils/helpers';

export class SearchHistoryRepository {
  private get db() {
    const db = databaseConnection.getDatabase();
    if (!db) {
      throw new Error('Database not initialized');
    }
    return db;
  }

  async saveSearchHistory(
    userId: string,
    query: string,
    locationId?: string,
    searchType: 'manual' | 'gps' | 'suggestion' = 'manual'
  ): Promise<SearchHistoryItem> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const id = generateId();
      const now = new Date().toISOString();
      
      await this.db.runAsync(
        `INSERT INTO search_history 
         (id, user_id, query, location_id, search_type, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, userId, query, locationId || null, searchType, now]
      );

      return {
        id,
        query,
        locationId,
        searchType,
        createdAt: new Date(now),
      };
    } catch (error) {
      console.error('Error saving search history:', error);
      throw error;
    }
  }

  async getSearchHistory(
    userId: string,
    limit: number = 10
  ): Promise<SearchHistoryItem[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const results = await this.db.getAllAsync<{
        id: string;
        user_id: string;
        query: string;
        location_id: string | null;
        search_type: string;
        created_at: string;
      }>(
        `SELECT * FROM search_history 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [userId, limit]
      );

      return results.map(row => ({
        id: row.id,
        userId: row.user_id,
        query: row.query,
        locationId: row.location_id || undefined,
        searchType: row.search_type as 'manual' | 'gps' | 'suggestion',
        createdAt: new Date(row.created_at),
      }));
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  async clearSearchHistory(userId: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      await this.db.runAsync(
        `DELETE FROM search_history WHERE user_id = ?`,
        [userId]
      );
    } catch (error) {
      console.error('Error clearing search history:', error);
      throw error;
    }
  }

  async deleteSearchHistoryItem(id: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      await this.db.runAsync(
        `DELETE FROM search_history WHERE id = ?`,
        [id]
      );
    } catch (error) {
      console.error('Error deleting search history item:', error);
      throw error;
    }
  }

  async getRecentQueries(userId: string, limit: number = 5): Promise<string[]> {
    try {
      const results = await this.db.getAllAsync<{ query: string }>(
        `SELECT DISTINCT query FROM search_history 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [userId, limit]
      );

      return results.map(row => row.query);
    } catch (error) {
      console.error('Error getting recent queries:', error);
      return [];
    }
  }

  async getSearchCount(userId: string): Promise<number> {
    try {
      const result = await this.db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM search_history WHERE user_id = ?`,
        [userId]
      );

      return result?.count || 0;
    } catch (error) {
      console.error('Error getting search count:', error);
      return 0;
    }
  }
}

export const searchHistoryRepository = new SearchHistoryRepository();
