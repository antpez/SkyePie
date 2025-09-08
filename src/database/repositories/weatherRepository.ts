import { databaseConnection } from '../connection';
import { CurrentWeather, WeatherForecast } from '../../types';

export class WeatherRepository {
  private get db() {
    const db = databaseConnection.getDatabase();
    if (!db) {
      throw new Error('Database not initialized');
    }
    return db;
  }

  async saveWeatherCache(
    locationId: string,
    weatherType: 'current' | 'forecast' | 'hourly',
    data: CurrentWeather | WeatherForecast,
    expiresAt: Date
  ): Promise<void> {
    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO weather_cache 
         (id, location_id, weather_type, data, expires_at) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          `${locationId}-${weatherType}`,
          locationId,
          weatherType,
          JSON.stringify(data),
          expiresAt.toISOString(),
        ]
      );
    } catch (error) {
      console.error('Error saving weather cache:', error);
      throw error;
    }
  }

  async getWeatherCache<T>(
    locationId: string,
    weatherType: 'current' | 'forecast' | 'hourly'
  ): Promise<T | null> {
    try {
      const result = await this.db.getFirstAsync<{
        data: string;
        expires_at: string;
      }>(
        `SELECT data, expires_at FROM weather_cache 
         WHERE location_id = ? AND weather_type = ?`,
        [locationId, weatherType]
      );

      if (!result) return null;

      const expiresAt = new Date(result.expires_at);
      if (expiresAt < new Date()) {
        // Cache expired, remove it
        await this.deleteWeatherCache(locationId, weatherType);
        return null;
      }

      return JSON.parse(result.data) as T;
    } catch (error) {
      console.error('Error getting weather cache:', error);
      return null;
    }
  }

  async deleteWeatherCache(
    locationId: string,
    weatherType: 'current' | 'forecast' | 'hourly'
  ): Promise<void> {
    try {
      await this.db.runAsync(
        `DELETE FROM weather_cache 
         WHERE location_id = ? AND weather_type = ?`,
        [locationId, weatherType]
      );
    } catch (error) {
      console.error('Error deleting weather cache:', error);
      throw error;
    }
  }

  async clearExpiredCache(): Promise<void> {
    try {
      await this.db.runAsync(
        `DELETE FROM weather_cache WHERE expires_at < ?`,
        [new Date().toISOString()]
      );
    } catch (error) {
      console.error('Error clearing expired cache:', error);
      throw error;
    }
  }
}

export const weatherRepository = new WeatherRepository();
