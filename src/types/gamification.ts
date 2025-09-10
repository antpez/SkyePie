export interface WeatherPrediction {
  id: string;
  date: Date;
  location: string;
  userPrediction: {
    temperature: number;
    condition: string;
    precipitation: boolean;
  };
  actualWeather?: {
    temperature: number;
    condition: string;
    precipitation: boolean;
  };
  accuracy: number; // 0-100
  points: number;
  isCompleted: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'prediction' | 'streak' | 'learning' | 'weather' | 'social';
  points: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number; // 0-100
  maxProgress: number;
}

export interface WeatherStreak {
  type: 'daily_prediction' | 'weekly_accuracy' | 'monthly_weather';
  current: number;
  best: number;
  lastActivity: Date;
  isActive: boolean;
}

export interface WeatherQuiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'meteorology' | 'climate' | 'weather_patterns' | 'safety';
  points: number;
}

export interface UserStats {
  totalPoints: number;
  level: number;
  experience: number;
  experienceToNext: number;
  predictionsMade: number;
  correctPredictions: number;
  accuracy: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  currentStreaks: WeatherStreak[];
  bestStreaks: WeatherStreak[];
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalPoints: number;
  level: number;
  accuracy: number;
  rank: number;
  avatar?: string;
}
