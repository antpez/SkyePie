export interface WeatherPhoto {
  id: string;
  userId: string;
  username: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  weatherCondition: string;
  temperature: number;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  createdAt: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  tags: string[];
}

export interface WeatherReport {
  id: string;
  userId: string;
  username: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  weatherCondition: string;
  temperature: number;
  description: string;
  photos: string[];
  createdAt: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  isVerified: boolean;
  verificationScore: number; // 0-100
}

export interface CommunityWeatherData {
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  reports: WeatherReport[];
  photos: WeatherPhoto[];
  averageTemperature: number;
  mostCommonCondition: string;
  lastUpdated: Date;
  confidence: number; // 0-100
}

export interface WeatherChallenge {
  id: string;
  title: string;
  description: string;
  type: 'photo' | 'prediction' | 'report' | 'learning';
  startDate: Date;
  endDate: Date;
  points: number;
  participants: number;
  isActive: boolean;
  requirements: string[];
  rewards: string[];
}

export interface SocialStats {
  photosShared: number;
  reportsSubmitted: number;
  likesReceived: number;
  commentsReceived: number;
  followers: number;
  following: number;
  reputation: number;
  level: number;
}
