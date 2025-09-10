export interface ClothingRecommendation {
  category: 'top' | 'bottom' | 'outerwear' | 'accessories' | 'footwear';
  item: string;
  reason: string;
  priority: 'essential' | 'recommended' | 'optional';
}

export interface ActivityRecommendation {
  activity: string;
  suitability: 'excellent' | 'good' | 'fair' | 'poor';
  reason: string;
  duration?: string;
  location?: 'indoor' | 'outdoor' | 'both';
  equipment?: string[];
}

export interface WeatherPattern {
  type: 'temperature_trend' | 'precipitation_pattern' | 'wind_pattern' | 'seasonal_shift';
  description: string;
  confidence: number; // 0-1
  impact: 'positive' | 'neutral' | 'negative';
  recommendation: string;
}

export interface MoodAnalysis {
  weatherMood: 'energetic' | 'calm' | 'cozy' | 'adventurous' | 'cautious' | 'neutral';
  confidence: number; // 0-1
  factors: string[];
  suggestions: string[];
}

export interface PersonalizedInsight {
  id: string;
  type: 'clothing' | 'activity' | 'pattern' | 'mood' | 'health' | 'general';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  validUntil: Date;
  isActive: boolean;
}

export interface UserPreferences {
  clothingStyle: 'casual' | 'formal' | 'sporty' | 'outdoor';
  activityLevel: 'low' | 'moderate' | 'high';
  healthConditions: string[];
  skinType: number; // 1-6
  allergies: string[];
  preferredActivities: string[];
  weatherSensitivity: 'low' | 'medium' | 'high';
}
