import { AccessibilityInfo, Platform } from 'react-native';

export interface AccessibilityConfig {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isReduceTransparencyEnabled: boolean;
  isBoldTextEnabled: boolean;
  isGrayscaleEnabled: boolean;
  isInvertColorsEnabled: boolean;
  isHighContrastEnabled: boolean;
  preferredContentSizeCategory: string;
}

export class AccessibilityManager {
  private static instance: AccessibilityManager;
  private config: AccessibilityConfig = {
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    isReduceTransparencyEnabled: false,
    isBoldTextEnabled: false,
    isGrayscaleEnabled: false,
    isInvertColorsEnabled: false,
    isHighContrastEnabled: false,
    preferredContentSizeCategory: 'medium',
  };

  private listeners: Array<(config: AccessibilityConfig) => void> = [];

  static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager();
    }
    return AccessibilityManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Check screen reader status
      const isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      this.config.isScreenReaderEnabled = isScreenReaderEnabled;

      // Check reduce motion preference
      const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      this.config.isReduceMotionEnabled = isReduceMotionEnabled;

      // Check reduce transparency preference
      const isReduceTransparencyEnabled = await AccessibilityInfo.isReduceTransparencyEnabled();
      this.config.isReduceTransparencyEnabled = isReduceTransparencyEnabled;

      // Check bold text preference
      const isBoldTextEnabled = await AccessibilityInfo.isBoldTextEnabled();
      this.config.isBoldTextEnabled = isBoldTextEnabled;

      // Check grayscale preference
      const isGrayscaleEnabled = await AccessibilityInfo.isGrayscaleEnabled();
      this.config.isGrayscaleEnabled = isGrayscaleEnabled;

      // Check invert colors preference
      const isInvertColorsEnabled = await AccessibilityInfo.isInvertColorsEnabled();
      this.config.isInvertColorsEnabled = isInvertColorsEnabled;

      // Check high contrast preference
      const isHighContrastEnabled = await AccessibilityInfo.isHighTextContrastEnabled();
      this.config.isHighContrastEnabled = isHighContrastEnabled;

      // Get preferred content size category (using a default timeout)
      const recommendedTimeout = await AccessibilityInfo.getRecommendedTimeoutMillis(1000);
      this.config.preferredContentSizeCategory = recommendedTimeout?.toString() || 'medium';

      // Set up listeners
      this.setupListeners();
    } catch (error) {
      console.error('Error initializing accessibility manager:', error);
    }
  }

  private setupListeners(): void {
    // Screen reader listener
    AccessibilityInfo.addEventListener('screenReaderChanged', (isEnabled) => {
      this.config.isScreenReaderEnabled = isEnabled;
      this.notifyListeners();
    });

    // Reduce motion listener
    AccessibilityInfo.addEventListener('reduceMotionChanged', (isEnabled) => {
      this.config.isReduceMotionEnabled = isEnabled;
      this.notifyListeners();
    });

    // Reduce transparency listener
    AccessibilityInfo.addEventListener('reduceTransparencyChanged', (isEnabled) => {
      this.config.isReduceTransparencyEnabled = isEnabled;
      this.notifyListeners();
    });

    // Bold text listener
    AccessibilityInfo.addEventListener('boldTextChanged', (isEnabled) => {
      this.config.isBoldTextEnabled = isEnabled;
      this.notifyListeners();
    });

    // Grayscale listener
    AccessibilityInfo.addEventListener('grayscaleChanged', (isEnabled) => {
      this.config.isGrayscaleEnabled = isEnabled;
      this.notifyListeners();
    });

    // Invert colors listener
    AccessibilityInfo.addEventListener('invertColorsChanged', (isEnabled) => {
      this.config.isInvertColorsEnabled = isEnabled;
      this.notifyListeners();
    });

    // High contrast listener
    AccessibilityInfo.addEventListener('highTextContrastChanged', (isEnabled: boolean) => {
      this.config.isHighContrastEnabled = isEnabled;
      this.notifyListeners();
    });
  }

  addListener(callback: (config: AccessibilityConfig) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.config));
  }

  getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  // Helper methods for common accessibility checks
  shouldReduceMotion(): boolean {
    return this.config.isReduceMotionEnabled;
  }

  shouldReduceTransparency(): boolean {
    return this.config.isReduceTransparencyEnabled;
  }

  isScreenReaderActive(): boolean {
    return this.config.isScreenReaderEnabled;
  }

  shouldUseHighContrast(): boolean {
    return this.config.isHighContrastEnabled || this.config.isInvertColorsEnabled;
  }

  shouldUseBoldText(): boolean {
    return this.config.isBoldTextEnabled;
  }

  isGrayscaleMode(): boolean {
    return this.config.isGrayscaleEnabled;
  }

  getContentSizeCategory(): string {
    return this.config.preferredContentSizeCategory;
  }

  // Get appropriate font size based on content size category
  getFontSize(baseSize: number): number {
    const category = this.config.preferredContentSizeCategory;
    const multipliers: { [key: string]: number } = {
      'extraSmall': 0.8,
      'small': 0.9,
      'medium': 1.0,
      'large': 1.1,
      'extraLarge': 1.2,
      'extraExtraLarge': 1.3,
      'extraExtraExtraLarge': 1.4,
      'accessibilityMedium': 1.5,
      'accessibilityLarge': 1.6,
      'accessibilityExtraLarge': 1.7,
      'accessibilityExtraExtraLarge': 1.8,
      'accessibilityExtraExtraExtraLarge': 1.9,
    };

    return baseSize * (multipliers[category] || 1.0);
  }

  // Get appropriate touch target size
  getMinTouchTargetSize(): number {
    return Platform.OS === 'ios' ? 44 : 48; // iOS and Android minimum touch targets
  }

  // Generate accessibility labels for weather data
  generateWeatherAccessibilityLabel(weather: any): string {
    const temp = weather.main?.temp || 0;
    const condition = weather.weather?.[0]?.description || 'unknown';
    const humidity = weather.main?.humidity || 0;
    const windSpeed = weather.wind?.speed || 0;
    const location = weather.name || 'Unknown location';

    return `${location}. ${condition}. Temperature ${Math.round(temp)} degrees. Humidity ${humidity} percent. Wind speed ${Math.round(windSpeed)}.`;
  }

  // Generate accessibility label for forecast items
  generateForecastAccessibilityLabel(forecast: any): string {
    const day = forecast.dayName || 'Unknown day';
    const high = forecast.dailyHigh || 0;
    const low = forecast.dailyLow || 0;
    const condition = forecast.weatherIcon?.description || 'unknown';

    return `${day}. High ${Math.round(high)} degrees. Low ${Math.round(low)} degrees. ${condition}.`;
  }
}

export const accessibilityManager = AccessibilityManager.getInstance();
