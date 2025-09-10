import { APP_CONFIG } from '../config/app';
import { CurrentWeather, WeatherForecast } from '../types/weather';
import { ClothingRecommendation, ActivityRecommendation, PersonalizedInsight, UserPreferences } from '../types/ai';

export class GroqService {
  private static instance: GroqService;
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = APP_CONFIG.api.groq.apiKey;
    this.baseUrl = APP_CONFIG.api.groq.baseUrl;
  }

  static getInstance(): GroqService {
    if (!GroqService.instance) {
      GroqService.instance = new GroqService();
    }
    return GroqService.instance;
  }

  private cleanJsonResponse(response: string): string {
    // Handle empty or null responses
    if (!response || response.trim().length === 0) {
      return '[]';
    }
    
    // Remove any text before the first [ or {
    let cleaned = response.trim();
    
    // Find the first JSON array or object
    const arrayStart = cleaned.indexOf('[');
    const objectStart = cleaned.indexOf('{');
    
    if (arrayStart !== -1 && (objectStart === -1 || arrayStart < objectStart)) {
      // Find the matching closing bracket
      let bracketCount = 0;
      let endIndex = arrayStart;
      for (let i = arrayStart; i < cleaned.length; i++) {
        if (cleaned[i] === '[') bracketCount++;
        if (cleaned[i] === ']') bracketCount--;
        if (bracketCount === 0) {
          endIndex = i;
          break;
        }
      }
      cleaned = cleaned.substring(arrayStart, endIndex + 1);
    } else if (objectStart !== -1) {
      // Find the matching closing brace
      let braceCount = 0;
      let endIndex = objectStart;
      for (let i = objectStart; i < cleaned.length; i++) {
        if (cleaned[i] === '{') braceCount++;
        if (cleaned[i] === '}') braceCount--;
        if (braceCount === 0) {
          endIndex = i;
          break;
        }
      }
      cleaned = cleaned.substring(objectStart, endIndex + 1);
    }
    
    // Remove any trailing text after JSON
    cleaned = cleaned.trim();
    
    // If it doesn't start with [ or {, try to extract JSON from markdown code blocks
    if (!cleaned.startsWith('[') && !cleaned.startsWith('{')) {
      const codeBlockMatch = cleaned.match(/```(?:json)?\s*(\[.*?\]|\{.*?\})\s*```/s);
      if (codeBlockMatch) {
        cleaned = codeBlockMatch[1];
      }
    }
    
    // If still no valid JSON found, return empty array
    if (!cleaned.startsWith('[') && !cleaned.startsWith('{')) {
      console.warn('No valid JSON found in AI response:', response);
      return '[]';
    }
    
    return cleaned;
  }

  private async makeAPICall(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant', // Fast and free model
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Groq API error: ${response.status}`;
        
        if (response.status === 401) {
          errorMessage += ' - Unauthorized. Please check your API key.';
        } else if (response.status === 429) {
          errorMessage += ' - Rate limit exceeded. Please try again later.';
        } else {
          errorMessage += ` - ${response.statusText}`;
        }
        
        console.error('Groq API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Groq API call failed:', error);
      throw error;
    }
  }

  async generateClothingRecommendations(
    weather: CurrentWeather, 
    forecast: WeatherForecast, 
    userPrefs: UserPreferences
  ): Promise<ClothingRecommendation[]> {
    // If not configured, return fallback immediately
    if (!this.isConfigured()) {
      console.log('Groq API not configured, using fallback recommendations');
      return this.getFallbackClothingRecommendations(weather);
    }

    const systemPrompt = `You are a weather fashion expert. Analyze weather data and provide specific clothing recommendations. 
    IMPORTANT: Return ONLY a valid JSON array. Do not include any text before or after the JSON.
    Return your response as a JSON array of clothing recommendations with this exact structure:
    [{"category": "top|bottom|outerwear|accessories|footwear", "item": "specific item name", "reason": "why this item is recommended", "priority": "essential|recommended|optional"}]`;

    const prompt = `Weather: ${weather.main.temp}°C, ${weather.weather[0].main}, humidity ${weather.main.humidity}%, wind ${weather.wind.speed} m/s
    User preferences: ${userPrefs.clothingStyle} style, ${userPrefs.weatherSensitivity} sensitivity
    Forecast: ${forecast.list.slice(0, 3).map(item => `${item.main.temp}°C ${item.weather[0].main}`).join(', ')}
    
    Provide 5-8 specific clothing recommendations for this weather.`;

    let response: string = '';
    try {
      response = await this.makeAPICall(prompt, systemPrompt);
      const cleanedResponse = this.cleanJsonResponse(response);
      
      // Validate JSON before parsing
      if (!cleanedResponse || cleanedResponse.trim() === '') {
        throw new Error('Empty response from AI');
      }
      
      const recommendations = JSON.parse(cleanedResponse);
      
      // Validate response structure
      if (!Array.isArray(recommendations)) {
        throw new Error('AI response is not an array');
      }
      
      return recommendations.map((rec: any) => ({
        category: rec.category as ClothingRecommendation['category'],
        item: rec.item,
        reason: rec.reason,
        priority: rec.priority as ClothingRecommendation['priority']
      }));
    } catch (error) {
      console.error('Failed to generate clothing recommendations:', error);
      if (error instanceof SyntaxError) {
        console.error('JSON Parse Error - Raw response:', response);
      }
      return this.getFallbackClothingRecommendations(weather);
    }
  }

  async generateActivityRecommendations(
    weather: CurrentWeather, 
    userPrefs: UserPreferences
  ): Promise<ActivityRecommendation[]> {
    // If not configured, return fallback immediately
    if (!this.isConfigured()) {
      console.log('Groq API not configured, using fallback recommendations');
      return this.getFallbackActivityRecommendations(weather);
    }

    const systemPrompt = `You are a weather activity expert. Suggest activities based on weather conditions and user preferences.
    IMPORTANT: Return ONLY a valid JSON array. Do not include any text before or after the JSON.
    Return your response as a JSON array of activity recommendations with this exact structure:
    [{"activity": "activity name", "suitability": "excellent|good|fair|poor", "reason": "why this activity is suitable", "duration": "suggested duration", "location": "indoor|outdoor|both", "equipment": ["item1", "item2"]}]`;

    const prompt = `Weather: ${weather.main.temp}°C, ${weather.weather[0].main}, humidity ${weather.main.humidity}%, wind ${weather.wind.speed} m/s
    User preferences: ${userPrefs.activityLevel} activity level, interests: ${userPrefs.preferredActivities.join(', ')}
    
    Suggest 6-10 activities suitable for this weather.`;

    let response: string = '';
    try {
      response = await this.makeAPICall(prompt, systemPrompt);
      const cleanedResponse = this.cleanJsonResponse(response);
      
      // Validate JSON before parsing
      if (!cleanedResponse || cleanedResponse.trim() === '') {
        throw new Error('Empty response from AI');
      }
      
      const recommendations = JSON.parse(cleanedResponse);
      
      // Validate response structure
      if (!Array.isArray(recommendations)) {
        throw new Error('AI response is not an array');
      }
      
      return recommendations.map((rec: any) => ({
        activity: rec.activity,
        suitability: rec.suitability as ActivityRecommendation['suitability'],
        reason: rec.reason,
        duration: rec.duration,
        location: rec.location as ActivityRecommendation['location'],
        equipment: rec.equipment || []
      }));
    } catch (error) {
      console.error('Failed to generate activity recommendations:', error);
      if (error instanceof SyntaxError) {
        console.error('JSON Parse Error - Raw response:', response);
      }
      return this.getFallbackActivityRecommendations(weather);
    }
  }

  async generatePersonalizedInsights(
    weather: CurrentWeather, 
    forecast: WeatherForecast, 
    userPrefs: UserPreferences
  ): Promise<PersonalizedInsight[]> {
    // If not configured, return fallback immediately
    if (!this.isConfigured()) {
      console.log('Groq API not configured, using fallback insights');
      return this.getFallbackInsights(weather);
    }

    const systemPrompt = `You are a personalized weather assistant. Generate helpful, personalized weather insights.
    IMPORTANT: Return ONLY a valid JSON array. Do not include any text before or after the JSON.
    Return your response as a JSON array of insights with this exact structure:
    [{"type": "clothing|activity|pattern|mood|health|general", "title": "insight title", "message": "detailed message", "priority": "low|medium|high"}]`;

    const prompt = `Weather: ${weather.main.temp}°C, ${weather.weather[0].main}, humidity ${weather.main.humidity}%, wind ${weather.wind.speed} m/s
    User profile: ${userPrefs.clothingStyle} style, ${userPrefs.activityLevel} activity level, ${userPrefs.weatherSensitivity} weather sensitivity
    Health conditions: ${userPrefs.healthConditions.join(', ') || 'none'}
    Allergies: ${userPrefs.allergies.join(', ') || 'none'}
    
    Generate 3-5 personalized insights for this user and weather.`;

    let response: string = '';
    try {
      response = await this.makeAPICall(prompt, systemPrompt);
      const cleanedResponse = this.cleanJsonResponse(response);
      
      // Validate JSON before parsing
      if (!cleanedResponse || cleanedResponse.trim() === '') {
        throw new Error('Empty response from AI');
      }
      
      const insights = JSON.parse(cleanedResponse);
      
      // Validate response structure
      if (!Array.isArray(insights)) {
        throw new Error('AI response is not an array');
      }
      
      return insights.map((insight: any) => ({
        id: `ai_insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: insight.type as PersonalizedInsight['type'],
        title: insight.title,
        message: insight.message,
        priority: insight.priority as PersonalizedInsight['priority'],
        validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
        isActive: true
      }));
    } catch (error) {
      console.error('Failed to generate personalized insights:', error);
      if (error instanceof SyntaxError) {
        console.error('JSON Parse Error - Raw response:', response);
      }
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

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'API key not configured' };
    }

    try {
      const response = await this.makeAPICall('Test connection', 'You are a helpful assistant. Respond with "OK" if you receive this message.');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  getConfigurationStatus(): { configured: boolean; apiKey: boolean; baseUrl: string } {
    return {
      configured: this.isConfigured(),
      apiKey: !!this.apiKey,
      baseUrl: this.baseUrl
    };
  }
}

export const groqService = GroqService.getInstance();
