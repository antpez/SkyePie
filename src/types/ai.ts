export interface ClothingRecommendation {
  id: string;
  category: 'top' | 'bottom' | 'outerwear' | 'accessories' | 'footwear';
  item: string;
  description: string;
  reason: string;
  temperatureRange: {
    min: number;
    max: number;
  };
  weatherConditions: string[];
  confidence: number; // 0-1
  priority?: 'essential' | 'recommended' | 'optional';
}

export interface ActivityRecommendation {
  id: string;
  name: string;
  description: string;
  category: 'outdoor' | 'indoor' | 'sports' | 'leisure' | 'work';
  weatherConditions: string[];
  temperatureRange: {
    min: number;
    max: number;
  };
  duration: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  confidence: number; // 0-1
  suitability?: string;
  location?: string;
  equipment?: string[];
}

export interface PersonalizedInsight {
  id: string;
  type: 'weather_trend' | 'health_tip' | 'activity_suggestion' | 'clothing_tip' | 'general';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  validUntil: Date;
  confidence: number; // 0-1
  isActive?: boolean;
}

export interface UserPreferences {
  id: string;
  userId: string;
  clothingStyle: 'casual' | 'formal' | 'sporty' | 'outdoor';
  activityLevel: 'low' | 'medium' | 'high';
  weatherSensitivity: 'low' | 'medium' | 'high';
  preferredActivities: string[];
  clothingBrands: string[];
  colorPreferences: string[];
  sizePreferences: {
    top: string;
    bottom: string;
    footwear: string;
  };
  allergies: string[];
  healthConditions: string[];
  createdAt: Date;
  updatedAt: Date;
}
