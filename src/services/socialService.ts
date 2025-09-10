import { 
  WeatherPhoto, 
  WeatherReport, 
  CommunityWeatherData, 
  WeatherChallenge, 
  SocialStats 
} from '../types/social';
import { CurrentWeather } from '../types/weather';

export class SocialService {
  private static instance: SocialService;
  private photos: WeatherPhoto[] = [];
  private reports: WeatherReport[] = [];
  private challenges: WeatherChallenge[] = [];
  private socialStats: SocialStats;

  constructor() {
    this.socialStats = {
      photosShared: 0,
      reportsSubmitted: 0,
      likesReceived: 0,
      commentsReceived: 0,
      followers: 0,
      following: 0,
      reputation: 0,
      level: 1
    };

    this.initializeChallenges();
  }

  static getInstance(): SocialService {
    if (!SocialService.instance) {
      SocialService.instance = new SocialService();
    }
    return SocialService.instance;
  }

  private initializeChallenges() {
    this.challenges = [
      {
        id: 'challenge_1',
        title: 'Sunset Spectacular',
        description: 'Share photos of beautiful sunsets in your area',
        type: 'photo',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        points: 50,
        participants: 0,
        isActive: true,
        requirements: ['Take a photo during sunset', 'Include weather conditions'],
        rewards: ['50 points', 'Sunset badge']
      },
      {
        id: 'challenge_2',
        title: 'Storm Chaser',
        description: 'Document stormy weather in your location',
        type: 'photo',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        points: 100,
        participants: 0,
        isActive: true,
        requirements: ['Take a photo during stormy weather', 'Stay safe!'],
        rewards: ['100 points', 'Storm Chaser badge']
      },
      {
        id: 'challenge_3',
        title: 'Weather Predictor',
        description: 'Make accurate weather predictions for your area',
        type: 'prediction',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        points: 200,
        participants: 0,
        isActive: true,
        requirements: ['Make 10 predictions', 'Achieve 80% accuracy'],
        rewards: ['200 points', 'Weather Prophet badge']
      }
    ];
  }

  shareWeatherPhoto(
    userId: string,
    username: string,
    location: WeatherPhoto['location'],
    weatherCondition: string,
    temperature: number,
    description: string,
    imageUrl: string,
    tags: string[] = []
  ): WeatherPhoto {
    const photo: WeatherPhoto = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      username,
      location,
      weatherCondition,
      temperature,
      description,
      imageUrl,
      thumbnailUrl: imageUrl, // In a real app, generate thumbnail
      createdAt: new Date(),
      likes: 0,
      comments: 0,
      isLiked: false,
      tags
    };

    this.photos.push(photo);
    this.socialStats.photosShared++;
    this.updateReputation(5);

    return photo;
  }

  submitWeatherReport(
    userId: string,
    username: string,
    location: WeatherReport['location'],
    weatherCondition: string,
    temperature: number,
    description: string,
    photos: string[] = []
  ): WeatherReport {
    const report: WeatherReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      username,
      location,
      weatherCondition,
      temperature,
      description,
      photos,
      createdAt: new Date(),
      likes: 0,
      comments: 0,
      isLiked: false,
      isVerified: false,
      verificationScore: 0
    };

    this.reports.push(report);
    this.socialStats.reportsSubmitted++;
    this.updateReputation(10);

    // Verify report against nearby reports
    this.verifyReport(report);

    return report;
  }

  private verifyReport(report: WeatherReport) {
    const nearbyReports = this.reports.filter(r => 
      r.id !== report.id &&
      this.calculateDistance(
        report.location.latitude,
        report.location.longitude,
        r.location.latitude,
        r.location.longitude
      ) < 10 // Within 10km
    );

    if (nearbyReports.length === 0) {
      report.verificationScore = 50; // Neutral score for isolated reports
      return;
    }

    // Check temperature consistency
    const avgTemperature = nearbyReports.reduce((sum, r) => sum + r.temperature, 0) / nearbyReports.length;
    const tempDifference = Math.abs(report.temperature - avgTemperature);
    const tempScore = Math.max(0, 100 - tempDifference * 5);

    // Check condition consistency
    const sameCondition = nearbyReports.filter(r => r.weatherCondition === report.weatherCondition).length;
    const conditionScore = (sameCondition / nearbyReports.length) * 100;

    report.verificationScore = (tempScore + conditionScore) / 2;
    report.isVerified = report.verificationScore > 70;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  getCommunityWeatherData(
    latitude: number, 
    longitude: number, 
    radius: number = 50
  ): CommunityWeatherData {
    const nearbyReports = this.reports.filter(r => 
      this.calculateDistance(latitude, longitude, r.location.latitude, r.location.longitude) <= radius
    );

    const nearbyPhotos = this.photos.filter(p => 
      this.calculateDistance(latitude, longitude, p.location.latitude, p.location.longitude) <= radius
    );

    const averageTemperature = nearbyReports.length > 0 
      ? nearbyReports.reduce((sum, r) => sum + r.temperature, 0) / nearbyReports.length
      : 0;

    const conditionCounts = nearbyReports.reduce((counts, r) => {
      counts[r.weatherCondition] = (counts[r.weatherCondition] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const mostCommonCondition = Object.entries(conditionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';

    const confidence = Math.min(100, nearbyReports.length * 10);

    return {
      location: {
        name: 'Community Data',
        latitude,
        longitude
      },
      reports: nearbyReports,
      photos: nearbyPhotos,
      averageTemperature,
      mostCommonCondition,
      lastUpdated: new Date(),
      confidence
    };
  }

  likePhoto(photoId: string, userId: string): boolean {
    const photo = this.photos.find(p => p.id === photoId);
    if (!photo) return false;

    if (photo.isLiked) {
      photo.likes--;
      photo.isLiked = false;
      this.socialStats.likesReceived--;
    } else {
      photo.likes++;
      photo.isLiked = true;
      this.socialStats.likesReceived++;
      this.updateReputation(1);
    }

    return true;
  }

  likeReport(reportId: string, userId: string): boolean {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return false;

    if (report.isLiked) {
      report.likes--;
      report.isLiked = false;
      this.socialStats.likesReceived--;
    } else {
      report.likes++;
      report.isLiked = true;
      this.socialStats.likesReceived++;
      this.updateReputation(2);
    }

    return true;
  }

  getRecentPhotos(limit: number = 20): WeatherPhoto[] {
    return this.photos
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  getRecentReports(limit: number = 20): WeatherReport[] {
    return this.reports
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  getActiveChallenges(): WeatherChallenge[] {
    return this.challenges.filter(c => c.isActive && c.endDate > new Date());
  }

  joinChallenge(challengeId: string, userId: string): boolean {
    const challenge = this.challenges.find(c => c.id === challengeId);
    if (!challenge || !challenge.isActive) return false;

    challenge.participants++;
    this.updateReputation(5);
    return true;
  }

  getSocialStats(): SocialStats {
    return { ...this.socialStats };
  }

  private updateReputation(points: number) {
    this.socialStats.reputation += points;
    
    // Update level based on reputation
    const newLevel = Math.floor(this.socialStats.reputation / 100) + 1;
    if (newLevel > this.socialStats.level) {
      this.socialStats.level = newLevel;
    }
  }

  searchPhotos(query: string, tags: string[] = []): WeatherPhoto[] {
    return this.photos.filter(photo => {
      const matchesQuery = query === '' || 
        photo.description.toLowerCase().includes(query.toLowerCase()) ||
        photo.location.name.toLowerCase().includes(query.toLowerCase()) ||
        photo.weatherCondition.toLowerCase().includes(query.toLowerCase());

      const matchesTags = tags.length === 0 || 
        tags.some(tag => photo.tags.includes(tag));

      return matchesQuery && matchesTags;
    });
  }

  getPhotosByLocation(latitude: number, longitude: number, radius: number = 10): WeatherPhoto[] {
    return this.photos.filter(photo => 
      this.calculateDistance(latitude, longitude, photo.location.latitude, photo.location.longitude) <= radius
    );
  }

  getPhotosByWeatherCondition(condition: string): WeatherPhoto[] {
    return this.photos.filter(photo => 
      photo.weatherCondition.toLowerCase() === condition.toLowerCase()
    );
  }
}

export const socialService = SocialService.getInstance();
