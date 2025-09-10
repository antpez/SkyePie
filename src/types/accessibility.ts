export interface VoiceWeatherReport {
  id: string;
  location: string;
  weather: {
    temperature: number;
    condition: string;
    description: string;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    uvIndex: number;
  };
  audioUrl: string;
  duration: number; // seconds
  language: string;
  voice: 'male' | 'female' | 'neutral';
  speed: 'slow' | 'normal' | 'fast';
}

export interface HapticAlert {
  id: string;
  type: 'weather_change' | 'severe_weather' | 'uv_alert' | 'air_quality' | 'pollen_alert';
  pattern: HapticPattern;
  intensity: 'light' | 'medium' | 'strong';
  duration: number; // milliseconds
  repeat: boolean;
  repeatInterval?: number; // milliseconds
}

export interface HapticPattern {
  type: 'single_tap' | 'double_tap' | 'triple_tap' | 'long_press' | 'vibration' | 'custom';
  sequence: number[]; // Array of vibration durations
  pause: number[]; // Array of pause durations between vibrations
}

export interface ColorblindFriendlyPalette {
  name: string;
  type: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochromacy' | 'general';
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: string;
  };
}

export interface SimplifiedLanguageMode {
  enabled: boolean;
  level: 'basic' | 'intermediate' | 'advanced';
  features: {
    simpleTerms: boolean;
    shortSentences: boolean;
    visualAids: boolean;
    audioDescriptions: boolean;
    largeText: boolean;
    highContrast: boolean;
  };
  customizations: {
    fontSize: 'small' | 'medium' | 'large' | 'extra_large';
    contrast: 'normal' | 'high' | 'maximum';
    animations: 'none' | 'reduced' | 'full';
    soundEffects: boolean;
    hapticFeedback: boolean;
  };
}

export interface AccessibilitySettings {
  voiceReports: {
    enabled: boolean;
    autoPlay: boolean;
    language: string;
    voice: 'male' | 'female' | 'neutral';
    speed: 'slow' | 'normal' | 'fast';
  };
  hapticAlerts: {
    enabled: boolean;
    intensity: 'light' | 'medium' | 'strong';
    weatherChanges: boolean;
    severeWeather: boolean;
    uvAlerts: boolean;
    airQuality: boolean;
    pollenAlerts: boolean;
  };
  visualAccessibility: {
    colorblindSupport: boolean;
    colorblindType: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochromacy' | 'general';
    highContrast: boolean;
    largeText: boolean;
    fontSize: 'small' | 'medium' | 'large' | 'extra_large';
    animations: 'none' | 'reduced' | 'full';
  };
  simplifiedMode: SimplifiedLanguageMode;
  screenReader: {
    enabled: boolean;
    announceChanges: boolean;
    detailedDescriptions: boolean;
  };
}

export interface WeatherDescription {
  simple: string;
  detailed: string;
  visual: string; // Description for screen readers
  audio: string; // Text for voice synthesis
}

export interface AccessibilityFeature {
  id: string;
  name: string;
  description: string;
  category: 'visual' | 'auditory' | 'motor' | 'cognitive';
  enabled: boolean;
  settings: Record<string, any>;
}
