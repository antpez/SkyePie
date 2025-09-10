import { 
  WeatherPrediction, 
  Achievement, 
  WeatherStreak, 
  WeatherQuiz, 
  UserStats, 
  LeaderboardEntry 
} from '../types/gamification';
import { CurrentWeather } from '../types/weather';

export class GamificationService {
  private static instance: GamificationService;
  private userStats: UserStats;
  private achievements: Achievement[];
  private predictions: WeatherPrediction[];

  constructor() {
    this.userStats = {
      totalPoints: 0,
      level: 1,
      experience: 0,
      experienceToNext: 100,
      predictionsMade: 0,
      correctPredictions: 0,
      accuracy: 0,
      achievementsUnlocked: 0,
      totalAchievements: 0,
      currentStreaks: [],
      bestStreaks: []
    };

    this.achievements = this.initializeAchievements();
    this.predictions = [];
  }

  static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  private initializeAchievements(): Achievement[] {
    return [
      {
        id: 'first_prediction',
        title: 'Weather Prophet',
        description: 'Make your first weather prediction',
        icon: 'crystal-ball',
        category: 'prediction',
        points: 10,
        isUnlocked: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'accurate_predictor',
        title: 'Accurate Predictor',
        description: 'Achieve 80% accuracy in 10 predictions',
        icon: 'target',
        category: 'prediction',
        points: 50,
        isUnlocked: false,
        progress: 0,
        maxProgress: 10
      },
      {
        id: 'weather_master',
        title: 'Weather Master',
        description: 'Achieve 90% accuracy in 50 predictions',
        icon: 'weather-lightning',
        category: 'prediction',
        points: 200,
        isUnlocked: false,
        progress: 0,
        maxProgress: 50
      },
      {
        id: 'daily_streak_7',
        title: 'Week Warrior',
        description: 'Make predictions for 7 consecutive days',
        icon: 'calendar-week',
        category: 'streak',
        points: 100,
        isUnlocked: false,
        progress: 0,
        maxProgress: 7
      },
      {
        id: 'daily_streak_30',
        title: 'Month Master',
        description: 'Make predictions for 30 consecutive days',
        icon: 'calendar-month',
        category: 'streak',
        points: 500,
        isUnlocked: false,
        progress: 0,
        maxProgress: 30
      },
      {
        id: 'quiz_enthusiast',
        title: 'Quiz Enthusiast',
        description: 'Complete 10 weather quizzes',
        icon: 'help-circle',
        category: 'learning',
        points: 75,
        isUnlocked: false,
        progress: 0,
        maxProgress: 10
      },
      {
        id: 'weather_scholar',
        title: 'Weather Scholar',
        description: 'Complete 50 weather quizzes with 80% accuracy',
        icon: 'school',
        category: 'learning',
        points: 300,
        isUnlocked: false,
        progress: 0,
        maxProgress: 50
      },
      {
        id: 'temperature_expert',
        title: 'Temperature Expert',
        description: 'Correctly predict temperature within 2°C 20 times',
        icon: 'thermometer',
        category: 'weather',
        points: 150,
        isUnlocked: false,
        progress: 0,
        maxProgress: 20
      },
      {
        id: 'condition_master',
        title: 'Condition Master',
        description: 'Correctly predict weather conditions 25 times',
        icon: 'weather-partly-cloudy',
        category: 'weather',
        points: 200,
        isUnlocked: false,
        progress: 0,
        maxProgress: 25
      },
      {
        id: 'point_collector',
        title: 'Point Collector',
        description: 'Earn 1000 total points',
        icon: 'star',
        category: 'social',
        points: 100,
        isUnlocked: false,
        progress: 0,
        maxProgress: 1000
      }
    ];
  }

  createWeatherPrediction(
    location: string,
    userPrediction: WeatherPrediction['userPrediction']
  ): WeatherPrediction {
    const prediction: WeatherPrediction = {
      id: `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date(),
      location,
      userPrediction,
      accuracy: 0,
      points: 0,
      isCompleted: false
    };

    this.predictions.push(prediction);
    this.userStats.predictionsMade++;
    this.updateAchievementProgress('first_prediction', 1);

    return prediction;
  }

  completeWeatherPrediction(predictionId: string, actualWeather: CurrentWeather): WeatherPrediction | null {
    const prediction = this.predictions.find(p => p.id === predictionId);
    if (!prediction) return null;

    const actual = {
      temperature: actualWeather.main.temp,
      condition: actualWeather.weather[0].main,
      precipitation: actualWeather.weather[0].main === 'Rain' || actualWeather.weather[0].main === 'Snow'
    };

    prediction.actualWeather = actual;
    prediction.isCompleted = true;

    // Calculate accuracy
    const tempAccuracy = Math.max(0, 100 - Math.abs(prediction.userPrediction.temperature - actual.temperature) * 5);
    const conditionAccuracy = prediction.userPrediction.condition === actual.condition ? 100 : 0;
    const precipitationAccuracy = prediction.userPrediction.precipitation === actual.precipitation ? 100 : 0;

    prediction.accuracy = (tempAccuracy + conditionAccuracy + precipitationAccuracy) / 3;
    prediction.points = Math.round(prediction.accuracy);

    // Update user stats
    this.userStats.totalPoints += prediction.points;
    this.userStats.experience += prediction.points;

    if (prediction.accuracy >= 80) {
      this.userStats.correctPredictions++;
    }

    this.userStats.accuracy = (this.userStats.correctPredictions / this.userStats.predictionsMade) * 100;

    // Update achievements
    this.updateAchievementProgress('accurate_predictor', prediction.accuracy >= 80 ? 1 : 0);
    this.updateAchievementProgress('weather_master', prediction.accuracy >= 90 ? 1 : 0);
    this.updateAchievementProgress('temperature_expert', Math.abs(prediction.userPrediction.temperature - actual.temperature) <= 2 ? 1 : 0);
    this.updateAchievementProgress('condition_master', prediction.userPrediction.condition === actual.condition ? 1 : 0);

    // Update streaks
    this.updateStreaks();

    // Check for level up
    this.checkLevelUp();

    return prediction;
  }

  private updateAchievementProgress(achievementId: string, progress: number) {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement) return;

    achievement.progress = Math.min(achievement.progress + progress, achievement.maxProgress);

    if (achievement.progress >= achievement.maxProgress && !achievement.isUnlocked) {
      achievement.isUnlocked = true;
      achievement.unlockedAt = new Date();
      this.userStats.achievementsUnlocked++;
    }
  }

  private updateStreaks() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Update daily prediction streak
    const hasPredictionToday = this.predictions.some(p => 
      p.date.toDateString() === today.toDateString()
    );

    const hasPredictionYesterday = this.predictions.some(p => 
      p.date.toDateString() === yesterday.toDateString()
    );

    let dailyStreak = this.userStats.currentStreaks.find(s => s.type === 'daily_prediction');
    if (!dailyStreak) {
      dailyStreak = {
        type: 'daily_prediction',
        current: 0,
        best: 0,
        lastActivity: new Date(),
        isActive: false
      };
      this.userStats.currentStreaks.push(dailyStreak);
    }

    if (hasPredictionToday) {
      if (hasPredictionYesterday || dailyStreak.current === 0) {
        dailyStreak.current++;
        dailyStreak.isActive = true;
        dailyStreak.lastActivity = today;
      }
    } else {
      dailyStreak.isActive = false;
    }

    dailyStreak.best = Math.max(dailyStreak.best, dailyStreak.current);

    // Update achievement progress
    this.updateAchievementProgress('daily_streak_7', dailyStreak.current >= 7 ? 1 : 0);
    this.updateAchievementProgress('daily_streak_30', dailyStreak.current >= 30 ? 1 : 0);
  }

  private checkLevelUp() {
    const newLevel = Math.floor(this.userStats.experience / 100) + 1;
    if (newLevel > this.userStats.level) {
      this.userStats.level = newLevel;
      this.userStats.experienceToNext = (newLevel * 100) - this.userStats.experience;
    }
  }

  generateWeatherQuiz(): WeatherQuiz {
    const quizzes: WeatherQuiz[] = [
      {
        id: 'quiz_1',
        question: 'What causes wind?',
        options: [
          'Differences in air pressure',
          'The rotation of the Earth',
          'Ocean currents',
          'Magnetic fields'
        ],
        correctAnswer: 0,
        explanation: 'Wind is caused by differences in air pressure. Air moves from high pressure areas to low pressure areas.',
        difficulty: 'easy',
        category: 'meteorology',
        points: 10
      },
      {
        id: 'quiz_2',
        question: 'What is the dew point?',
        options: [
          'The temperature at which water vapor condenses',
          'The temperature at which ice melts',
          'The temperature at which water boils',
          'The temperature at which snow forms'
        ],
        correctAnswer: 0,
        explanation: 'The dew point is the temperature at which water vapor in the air condenses into liquid water.',
        difficulty: 'medium',
        category: 'meteorology',
        points: 15
      },
      {
        id: 'quiz_3',
        question: 'What is a cold front?',
        options: [
          'A boundary where cold air replaces warm air',
          'A boundary where warm air replaces cold air',
          'A stationary weather system',
          'A high pressure system'
        ],
        correctAnswer: 0,
        explanation: 'A cold front is a boundary where cold air mass replaces a warm air mass, often bringing storms.',
        difficulty: 'medium',
        category: 'weather_patterns',
        points: 15
      },
      {
        id: 'quiz_4',
        question: 'What is the greenhouse effect?',
        options: [
          'The trapping of heat by greenhouse gases',
          'The cooling of the Earth\'s surface',
          'The formation of clouds',
          'The melting of polar ice caps'
        ],
        correctAnswer: 0,
        explanation: 'The greenhouse effect is the process by which greenhouse gases trap heat in the Earth\'s atmosphere.',
        difficulty: 'easy',
        category: 'climate',
        points: 10
      },
      {
        id: 'quiz_5',
        question: 'What is the difference between weather and climate?',
        options: [
          'Weather is short-term, climate is long-term',
          'Weather is long-term, climate is short-term',
          'There is no difference',
          'Weather affects temperature, climate affects precipitation'
        ],
        correctAnswer: 0,
        explanation: 'Weather refers to short-term atmospheric conditions, while climate refers to long-term patterns.',
        difficulty: 'easy',
        category: 'climate',
        points: 10
      }
    ];

    return quizzes[Math.floor(Math.random() * quizzes.length)];
  }

  submitQuizAnswer(quizId: string, answer: number): { correct: boolean; points: number; explanation: string } {
    const quiz = this.generateWeatherQuiz();
    if (!quiz) return { correct: false, points: 0, explanation: '' };

    const isCorrect = answer === quiz.correctAnswer;
    const points = isCorrect ? 10 : 0;

    if (isCorrect) {
      this.userStats.totalPoints += points;
      this.userStats.experience += points;
      this.updateAchievementProgress('quiz_enthusiast', 1);
      this.updateAchievementProgress('weather_scholar', 1);
    }

    return {
      correct: isCorrect,
      points,
      explanation: quiz.explanation
    };
  }

  getUserStats(): UserStats {
    return { ...this.userStats };
  }

  getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  getPredictions(): WeatherPrediction[] {
    return [...this.predictions];
  }

  getLeaderboard(): LeaderboardEntry[] {
    // In a real app, this would fetch from a server
    return [
      {
        userId: 'user1',
        username: 'WeatherWizard',
        totalPoints: 1500,
        level: 15,
        accuracy: 92,
        rank: 1
      },
      {
        userId: 'user2',
        username: 'StormChaser',
        totalPoints: 1200,
        level: 12,
        accuracy: 88,
        rank: 2
      },
      {
        userId: 'user3',
        username: 'CloudWatcher',
        totalPoints: 950,
        level: 9,
        accuracy: 85,
        rank: 3
      }
    ];
  }

  resetUserData() {
    this.userStats = {
      totalPoints: 0,
      level: 1,
      experience: 0,
      experienceToNext: 100,
      predictionsMade: 0,
      correctPredictions: 0,
      accuracy: 0,
      achievementsUnlocked: 0,
      totalAchievements: this.achievements.length,
      currentStreaks: [],
      bestStreaks: []
    };

    this.achievements.forEach(achievement => {
      achievement.isUnlocked = false;
      achievement.progress = 0;
      achievement.unlockedAt = undefined;
    });

    this.predictions = [];
  }
}

export const gamificationService = GamificationService.getInstance();
