import { 
  ClothingRecommendation, 
  ActivityRecommendation, 
  WeatherPattern, 
  MoodAnalysis, 
  PersonalizedInsight,
  UserPreferences 
} from '../types/ai';
import { CurrentWeather, WeatherForecast } from '../types/weather';
import { aiServiceSelector } from './aiServiceSelector';

export class AIService {
  private static instance: AIService;
  private userPreferences: UserPreferences;

  constructor() {
    // Default user preferences - in a real app, this would be loaded from user settings
    this.userPreferences = {
      clothingStyle: 'casual',
      activityLevel: 'moderate',
      healthConditions: [],
      skinType: 3,
      allergies: [],
      preferredActivities: ['walking', 'reading', 'cooking'],
      weatherSensitivity: 'medium'
    };
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateClothingRecommendations(weather: CurrentWeather, forecast: WeatherForecast): Promise<ClothingRecommendation[]> {
    // Try AI service selector (handles Groq and fallbacks)
    try {
      return await aiServiceSelector.generateClothingRecommendations(weather, forecast, this.userPreferences);
    } catch (error) {
      console.warn('AI service unavailable, falling back to basic recommendations:', error);
    }

    // Fallback to basic recommendations
    const recommendations: ClothingRecommendation[] = [];
    const temp = weather.main.temp;
    const condition = weather.weather[0].main;
    const windSpeed = weather.wind.speed;
    const humidity = weather.main.humidity;

    // Top recommendations
    if (temp < 0) {
      recommendations.push({
        category: 'top',
        item: 'Thermal base layer',
        reason: 'Essential for sub-zero temperatures',
        priority: 'essential'
      });
      recommendations.push({
        category: 'top',
        item: 'Wool sweater or fleece',
        reason: 'Provides excellent insulation',
        priority: 'essential'
      });
    } else if (temp < 10) {
      recommendations.push({
        category: 'top',
        item: 'Long-sleeve shirt',
        reason: 'Comfortable for cool weather',
        priority: 'essential'
      });
      recommendations.push({
        category: 'top',
        item: 'Light sweater or cardigan',
        reason: 'Easy to layer and remove',
        priority: 'recommended'
      });
    } else if (temp < 20) {
      recommendations.push({
        category: 'top',
        item: 'T-shirt or blouse',
        reason: 'Perfect for mild temperatures',
        priority: 'essential'
      });
      recommendations.push({
        category: 'top',
        item: 'Light jacket or hoodie',
        reason: 'Good for layering',
        priority: 'recommended'
      });
    } else {
      recommendations.push({
        category: 'top',
        item: 'Light, breathable shirt',
        reason: 'Comfortable in warm weather',
        priority: 'essential'
      });
    }

    // Bottom recommendations
    if (temp < 5) {
      recommendations.push({
        category: 'bottom',
        item: 'Thermal pants or leggings',
        reason: 'Essential for cold weather',
        priority: 'essential'
      });
      recommendations.push({
        category: 'bottom',
        item: 'Jeans or thick pants',
        reason: 'Additional insulation',
        priority: 'essential'
      });
    } else if (temp < 15) {
      recommendations.push({
        category: 'bottom',
        item: 'Jeans or long pants',
        reason: 'Comfortable for cool weather',
        priority: 'essential'
      });
    } else {
      recommendations.push({
        category: 'bottom',
        item: 'Shorts or light pants',
        reason: 'Comfortable in warm weather',
        priority: 'essential'
      });
    }

    // Outerwear recommendations
    if (condition === 'Rain' || condition === 'Drizzle') {
      recommendations.push({
        category: 'outerwear',
        item: 'Waterproof jacket',
        reason: 'Essential for rain protection',
        priority: 'essential'
      });
      recommendations.push({
        category: 'outerwear',
        item: 'Umbrella',
        reason: 'Additional rain protection',
        priority: 'recommended'
      });
    } else if (temp < 10) {
      recommendations.push({
        category: 'outerwear',
        item: 'Warm coat or jacket',
        reason: 'Essential for cold weather',
        priority: 'essential'
      });
    } else if (temp < 20) {
      recommendations.push({
        category: 'outerwear',
        item: 'Light jacket or cardigan',
        reason: 'Good for layering',
        priority: 'recommended'
      });
    }

    // Accessories
    if (temp < 10) {
      recommendations.push({
        category: 'accessories',
        item: 'Gloves and hat',
        reason: 'Protect extremities from cold',
        priority: 'essential'
      });
      recommendations.push({
        category: 'accessories',
        item: 'Scarf',
        reason: 'Additional neck protection',
        priority: 'recommended'
      });
    }

    if (windSpeed > 5) {
      recommendations.push({
        category: 'accessories',
        item: 'Windbreaker or wind-resistant jacket',
        reason: 'Protection from strong winds',
        priority: 'recommended'
      });
    }

    // Footwear
    if (condition === 'Rain' || condition === 'Snow') {
      recommendations.push({
        category: 'footwear',
        item: 'Waterproof boots',
        reason: 'Essential for wet conditions',
        priority: 'essential'
      });
    } else if (temp < 5) {
      recommendations.push({
        category: 'footwear',
        item: 'Warm, insulated shoes',
        reason: 'Keep feet warm in cold weather',
        priority: 'essential'
      });
    } else {
      recommendations.push({
        category: 'footwear',
        item: 'Comfortable walking shoes',
        reason: 'Suitable for current conditions',
        priority: 'essential'
      });
    }

    return recommendations;
  }

  async generateActivityRecommendations(weather: CurrentWeather, userPrefs: UserPreferences): Promise<ActivityRecommendation[]> {
    // Try AI service selector (handles Groq and fallbacks)
    try {
      return await aiServiceSelector.generateActivityRecommendations(weather, userPrefs);
    } catch (error) {
      console.warn('AI service unavailable, falling back to basic recommendations:', error);
    }

    // Fallback to basic recommendations
    const recommendations: ActivityRecommendation[] = [];
    const temp = weather.main.temp;
    const condition = weather.weather[0].main;
    const windSpeed = weather.wind.speed;
    const humidity = weather.main.humidity;

    // Indoor activities
    const indoorActivities = [
      { activity: 'Reading', suitability: 'excellent' as const, reason: 'Perfect for any weather' },
      { activity: 'Cooking', suitability: 'excellent' as const, reason: 'Great indoor activity' },
      { activity: 'Yoga', suitability: 'excellent' as const, reason: 'Relaxing indoor exercise' },
      { activity: 'Movie watching', suitability: 'excellent' as const, reason: 'Comfortable indoor entertainment' },
      { activity: 'Board games', suitability: 'excellent' as const, reason: 'Fun indoor social activity' }
    ];

    // Outdoor activities based on weather
    const outdoorActivities: ActivityRecommendation[] = [];

    if (condition === 'Clear' && temp > 15 && temp < 30) {
      outdoorActivities.push({
        activity: 'Walking or hiking',
        suitability: 'excellent',
        reason: 'Perfect weather for outdoor exercise',
        duration: '30-60 minutes',
        location: 'outdoor'
      });
      outdoorActivities.push({
        activity: 'Picnic',
        suitability: 'excellent',
        reason: 'Ideal conditions for outdoor dining',
        duration: '1-2 hours',
        location: 'outdoor'
      });
      outdoorActivities.push({
        activity: 'Gardening',
        suitability: 'excellent',
        reason: 'Great weather for outdoor work',
        duration: '1-3 hours',
        location: 'outdoor'
      });
    } else if (condition === 'Clear' && temp > 5 && temp < 15) {
      outdoorActivities.push({
        activity: 'Walking',
        suitability: 'good',
        reason: 'Cool but pleasant for walking',
        duration: '20-45 minutes',
        location: 'outdoor'
      });
      outdoorActivities.push({
        activity: 'Cycling',
        suitability: 'good',
        reason: 'Cool weather is good for cycling',
        duration: '30-60 minutes',
        location: 'outdoor'
      });
    } else if (condition === 'Rain') {
      outdoorActivities.push({
        activity: 'Walking in rain',
        suitability: 'fair',
        reason: 'Possible with proper rain gear',
        duration: '15-30 minutes',
        location: 'outdoor',
        equipment: ['Rain jacket', 'Umbrella', 'Waterproof shoes']
      });
    } else if (temp < 0) {
      outdoorActivities.push({
        activity: 'Winter sports',
        suitability: 'excellent',
        reason: 'Perfect for cold weather activities',
        duration: '1-3 hours',
        location: 'outdoor',
        equipment: ['Warm clothing', 'Appropriate gear']
      });
    } else if (temp > 30) {
      outdoorActivities.push({
        activity: 'Swimming',
        suitability: 'excellent',
        reason: 'Great way to cool down',
        duration: '30-60 minutes',
        location: 'both'
      });
      outdoorActivities.push({
        activity: 'Early morning walk',
        suitability: 'good',
        reason: 'Cooler temperatures in the morning',
        duration: '20-40 minutes',
        location: 'outdoor'
      });
    }

    // Add indoor activities
    indoorActivities.forEach(activity => {
      recommendations.push({
        ...activity,
        duration: '30-60 minutes',
        location: 'indoor'
      });
    });

    // Add outdoor activities
    recommendations.push(...outdoorActivities);

    // Filter based on user preferences
    return recommendations.filter(rec => 
      userPrefs.preferredActivities.some(pref => 
        rec.activity.toLowerCase().includes(pref.toLowerCase())
      ) || rec.location === 'indoor'
    );
  }

  analyzeWeatherPatterns(weather: CurrentWeather, forecast: WeatherForecast): WeatherPattern[] {
    const patterns: WeatherPattern[] = [];

    // Temperature trend analysis
    const currentTemp = weather.main.temp;
    const forecastTemps = forecast.list.slice(0, 8).map(item => item.main.temp);
    const avgForecastTemp = forecastTemps.reduce((sum, temp) => sum + temp, 0) / forecastTemps.length;
    const tempTrend = avgForecastTemp - currentTemp;

    if (Math.abs(tempTrend) > 5) {
      patterns.push({
        type: 'temperature_trend',
        description: `Temperature ${tempTrend > 0 ? 'rising' : 'dropping'} by ${Math.abs(tempTrend).toFixed(1)}°C over next 24 hours`,
        confidence: 0.8,
        impact: tempTrend > 0 ? 'positive' : 'negative',
        recommendation: tempTrend > 0 
          ? 'Consider lighter clothing for tomorrow'
          : 'Prepare for cooler weather tomorrow'
      });
    }

    // Precipitation pattern analysis
    const rainChance = forecast.list.slice(0, 8).filter(item => 
      item.weather[0].main === 'Rain' || item.weather[0].main === 'Drizzle'
    ).length / 8;

    if (rainChance > 0.5) {
      patterns.push({
        type: 'precipitation_pattern',
        description: `High chance of rain (${Math.round(rainChance * 100)}%) over next 24 hours`,
        confidence: 0.7,
        impact: 'negative',
        recommendation: 'Carry an umbrella and plan indoor activities'
      });
    }

    // Wind pattern analysis
    const avgWindSpeed = forecast.list.slice(0, 8).reduce((sum, item) => sum + item.wind.speed, 0) / 8;
    if (avgWindSpeed > 10) {
      patterns.push({
        type: 'wind_pattern',
        description: `Strong winds expected (${avgWindSpeed.toFixed(1)} m/s average)`,
        confidence: 0.6,
        impact: 'negative',
        recommendation: 'Secure loose objects and avoid outdoor activities'
      });
    }

    return patterns;
  }

  analyzeWeatherMood(weather: CurrentWeather, userPrefs: UserPreferences): MoodAnalysis {
    const temp = weather.main.temp;
    const condition = weather.weather[0].main;
    const windSpeed = weather.wind.speed;
    const humidity = weather.main.humidity;

    let weatherMood: MoodAnalysis['weatherMood'] = 'neutral';
    const factors: string[] = [];
    const suggestions: string[] = [];

    // Temperature-based mood
    if (temp > 25 && condition === 'Clear') {
      weatherMood = 'energetic';
      factors.push('Warm, sunny weather');
      suggestions.push('Great day for outdoor activities');
    } else if (temp > 15 && temp < 25 && condition === 'Clear') {
      weatherMood = 'adventurous';
      factors.push('Perfect outdoor conditions');
      suggestions.push('Ideal for exploring and adventures');
    } else if (temp < 10 && condition === 'Clear') {
      weatherMood = 'cozy';
      factors.push('Cool, crisp weather');
      suggestions.push('Perfect for indoor activities and warm drinks');
    } else if (condition === 'Rain') {
      weatherMood = 'calm';
      factors.push('Rainy weather');
      suggestions.push('Great for reading, relaxing, or creative activities');
    } else if (windSpeed > 8) {
      weatherMood = 'cautious';
      factors.push('Strong winds');
      suggestions.push('Be careful outdoors, consider indoor activities');
    } else if (temp > 30) {
      weatherMood = 'cautious';
      factors.push('Very hot weather');
      suggestions.push('Stay hydrated and avoid prolonged sun exposure');
    }

    // Adjust based on user preferences
    if (userPrefs.weatherSensitivity === 'high') {
      if (weatherMood === 'cautious') {
        suggestions.push('Consider staying indoors due to weather sensitivity');
      }
    }

    return {
      weatherMood,
      confidence: 0.7,
      factors,
      suggestions
    };
  }

  async generatePersonalizedInsights(
    weather: CurrentWeather, 
    forecast: WeatherForecast, 
    userPrefs: UserPreferences
  ): Promise<PersonalizedInsight[]> {
    // Try AI service selector (handles Groq and fallbacks)
    try {
      return await aiServiceSelector.generatePersonalizedInsights(weather, forecast, userPrefs);
    } catch (error) {
      console.warn('AI service unavailable, falling back to basic insights:', error);
    }

    // Fallback to basic insights
    const insights: PersonalizedInsight[] = [];
    const clothingRecs = await this.generateClothingRecommendations(weather, forecast);
    const activityRecs = await this.generateActivityRecommendations(weather, userPrefs);
    const patterns = this.analyzeWeatherPatterns(weather, forecast);
    const mood = this.analyzeWeatherMood(weather, userPrefs);

    // Clothing insights
    const essentialClothing = clothingRecs.filter((rec: ClothingRecommendation) => rec.priority === 'essential');
    if (essentialClothing.length > 0) {
      insights.push({
        id: 'clothing-essential',
        type: 'clothing',
        title: 'Essential Clothing',
        message: `Don't forget: ${essentialClothing.map((rec: ClothingRecommendation) => rec.item).join(', ')}`,
        priority: 'high',
        validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
        isActive: true
      });
    }

    // Activity insights
    const excellentActivities = activityRecs.filter((rec: ActivityRecommendation) => rec.suitability === 'excellent');
    if (excellentActivities.length > 0) {
      insights.push({
        id: 'activity-excellent',
        type: 'activity',
        title: 'Perfect Activities',
        message: `Great weather for: ${excellentActivities.map((rec: ActivityRecommendation) => rec.activity).join(', ')}`,
        priority: 'medium',
        validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
        isActive: true
      });
    }

    // Pattern insights
    patterns.forEach((pattern, index) => {
      insights.push({
        id: `pattern-${index}`,
        type: 'pattern',
        title: 'Weather Pattern',
        message: pattern.description,
        priority: pattern.impact === 'negative' ? 'high' : 'medium',
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        isActive: true
      });
    });

    // Mood insights
    if (mood.weatherMood !== 'neutral') {
      insights.push({
        id: 'mood-analysis',
        type: 'mood',
        title: 'Weather Mood',
        message: `Today's weather suggests a ${mood.weatherMood} mood. ${mood.suggestions[0]}`,
        priority: 'low',
        validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
        isActive: true
      });
    }

    return insights;
  }

  updateUserPreferences(preferences: Partial<UserPreferences>) {
    this.userPreferences = { ...this.userPreferences, ...preferences };
  }

  getUserPreferences(): UserPreferences {
    return this.userPreferences;
  }
}

export const aiService = AIService.getInstance();
