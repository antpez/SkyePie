import { groqService } from './groqService';
import { CurrentWeather, WeatherForecast } from '../types/weather';
import { ClothingRecommendation, ActivityRecommendation, PersonalizedInsight, UserPreferences } from '../types/ai';

export type AIProvider = 'groq' | 'fallback';

export class AIServiceSelector {
  private static instance: AIServiceSelector;
  private currentProvider: AIProvider = 'fallback';

  constructor() {
    this.detectBestProvider();
  }

  static getInstance(): AIServiceSelector {
    if (!AIServiceSelector.instance) {
      AIServiceSelector.instance = new AIServiceSelector();
    }
    return AIServiceSelector.instance;
  }

  private detectBestProvider(): void {
    // Check which services are available and working
    if (groqService.isConfigured()) {
      this.currentProvider = 'groq';
    } else {
      this.currentProvider = 'fallback';
    }
  }

  async setProvider(provider: AIProvider): Promise<void> {
    this.currentProvider = provider;
  }

  getCurrentProvider(): AIProvider {
    return this.currentProvider;
  }

  async getAvailableProviders(): Promise<{ provider: AIProvider; available: boolean; reason?: string }[]> {
    const providers = [
      {
        provider: 'groq' as AIProvider,
        available: groqService.isConfigured(),
        reason: groqService.isConfigured() ? undefined : 'Groq API key not configured'
      },
      {
        provider: 'fallback' as AIProvider,
        available: true,
        reason: 'Always available - uses basic recommendations'
      }
    ];

    // Test actual connectivity for configured services
    for (const provider of providers) {
      if (provider.available && provider.provider !== 'fallback') {
        try {
          const testResult = await this.testProvider(provider.provider);
          provider.available = testResult.success;
          if (!testResult.success) {
            provider.reason = testResult.error || 'Connection test failed';
          }
        } catch (error) {
          provider.available = false;
          provider.reason = 'Connection test failed';
        }
      }
    }

    return providers;
  }

  private async testProvider(provider: AIProvider): Promise<{ success: boolean; error?: string }> {
    switch (provider) {
      case 'groq':
        return await groqService.testConnection();
      case 'fallback':
        return { success: true };
      default:
        return { success: false, error: 'Unknown provider' };
    }
  }

  async generateClothingRecommendations(
    weather: CurrentWeather,
    forecast: WeatherForecast,
    userPrefs: UserPreferences
  ): Promise<ClothingRecommendation[]> {
    try {
      switch (this.currentProvider) {
        case 'groq':
          return await groqService.generateClothingRecommendations(weather, forecast, userPrefs);
        case 'fallback':
        default:
          return this.getFallbackClothingRecommendations(weather);
      }
    } catch (error) {
      console.error(`Failed to generate clothing recommendations with ${this.currentProvider}:`, error);
      // Try fallback
      return this.getFallbackClothingRecommendations(weather);
    }
  }

  async generateActivityRecommendations(
    weather: CurrentWeather,
    userPrefs: UserPreferences
  ): Promise<ActivityRecommendation[]> {
    try {
      switch (this.currentProvider) {
        case 'groq':
          return await groqService.generateActivityRecommendations(weather, userPrefs);
        case 'fallback':
        default:
          return this.getFallbackActivityRecommendations(weather);
      }
    } catch (error) {
      console.error(`Failed to generate activity recommendations with ${this.currentProvider}:`, error);
      return this.getFallbackActivityRecommendations(weather);
    }
  }

  async generatePersonalizedInsights(
    weather: CurrentWeather,
    forecast: WeatherForecast,
    userPrefs: UserPreferences
  ): Promise<PersonalizedInsight[]> {
    try {
      switch (this.currentProvider) {
        case 'groq':
          return await groqService.generatePersonalizedInsights(weather, forecast, userPrefs);
        case 'fallback':
        default:
          return this.getFallbackInsights(weather);
      }
    } catch (error) {
      console.error(`Failed to generate personalized insights with ${this.currentProvider}:`, error);
      return this.getFallbackInsights(weather);
    }
  }

  // Fallback methods
  private getFallbackClothingRecommendations(weather: CurrentWeather): ClothingRecommendation[] {
    const temp = weather.main.temp;
    const condition = weather.weather[0].main;
    
    const recommendations: ClothingRecommendation[] = [];
    
    if (temp < 10) {
      recommendations.push({
        category: 'outerwear',
        item: 'Warm coat',
        reason: 'Cold weather protection',
        priority: 'essential'
      });
    } else if (temp > 25) {
      recommendations.push({
        category: 'top',
        item: 'Light t-shirt',
        reason: 'Comfortable for warm weather',
        priority: 'essential'
      });
    }
    
    if (condition === 'Rain') {
      recommendations.push({
        category: 'accessories',
        item: 'Umbrella',
        reason: 'Rain protection',
        priority: 'essential'
      });
    }
    
    return recommendations;
  }

  private getFallbackActivityRecommendations(weather: CurrentWeather): ActivityRecommendation[] {
    const temp = weather.main.temp;
    const condition = weather.weather[0].main;
    
    const recommendations: ActivityRecommendation[] = [];
    
    if (temp > 20 && condition === 'Clear') {
      recommendations.push({
        activity: 'Outdoor walking',
        suitability: 'excellent',
        reason: 'Perfect weather for outdoor activities',
        duration: '30-60 minutes',
        location: 'outdoor'
      });
    } else if (condition === 'Rain') {
      recommendations.push({
        activity: 'Indoor reading',
        suitability: 'excellent',
        reason: 'Great weather for indoor activities',
        duration: '1-2 hours',
        location: 'indoor'
      });
    }
    
    return recommendations;
  }

  private getFallbackInsights(weather: CurrentWeather): PersonalizedInsight[] {
    return [
      {
        id: `fallback_insight_${Date.now()}`,
        type: 'general',
        title: 'Weather Update',
        message: `Current temperature is ${weather.main.temp}°C with ${weather.weather[0].main} conditions.`,
        priority: 'low',
        validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000),
        isActive: true
      }
    ];
  }

  getStatus(): { provider: AIProvider; configured: boolean; details: any } {
    switch (this.currentProvider) {
      case 'groq':
        return {
          provider: 'groq',
          configured: groqService.isConfigured(),
          details: groqService.getConfigurationStatus()
        };
      case 'fallback':
      default:
        return {
          provider: 'fallback',
          configured: true,
          details: { message: 'Using fallback recommendations' }
        };
    }
  }
}

export const aiServiceSelector = AIServiceSelector.getInstance();
