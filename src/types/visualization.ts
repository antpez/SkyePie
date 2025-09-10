export interface WeatherAnimation {
  id: string;
  type: 'temperature' | 'precipitation' | 'wind' | 'pressure' | 'clouds' | 'uv_index';
  duration: number; // seconds
  frames: AnimationFrame[];
  loop: boolean;
  speed: 'slow' | 'normal' | 'fast';
}

export interface AnimationFrame {
  timestamp: number; // milliseconds
  data: {
    value: number;
    position: { x: number; y: number };
    color: string;
    size: number;
  };
  transition: {
    duration: number;
    easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  };
}

export interface Weather3DModel {
  id: string;
  type: 'temperature' | 'precipitation' | 'wind' | 'pressure' | 'clouds';
  vertices: number[][];
  colors: number[][];
  texture: string;
  animation: {
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
    position: { x: number; y: number; z: number };
  };
  lighting: {
    ambient: number;
    directional: number;
    position: { x: number; y: number; z: number };
  };
}

export interface WeatherSoundscape {
  id: string;
  name: string;
  weatherCondition: string;
  audioUrl: string;
  duration: number; // seconds
  volume: number; // 0-1
  loop: boolean;
  fadeIn: number; // seconds
  fadeOut: number; // seconds
  layers: SoundLayer[];
}

export interface SoundLayer {
  id: string;
  name: string;
  audioUrl: string;
  volume: number; // 0-1
  pan: number; // -1 to 1 (left to right)
  frequency: number; // Hz
  filter: {
    type: 'lowpass' | 'highpass' | 'bandpass' | 'notch';
    frequency: number;
    q: number;
  };
}

export interface ARWeatherOverlay {
  id: string;
  type: 'temperature' | 'humidity' | 'wind' | 'pressure' | 'uv_index' | 'precipitation';
  position: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  data: {
    value: number;
    unit: string;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  visual: {
    color: string;
    size: number;
    opacity: number;
    shape: 'circle' | 'square' | 'triangle' | 'arrow';
  };
  animation: {
    type: 'pulse' | 'rotate' | 'float' | 'none';
    speed: number;
    intensity: number;
  };
}

export interface WeatherTimeline {
  id: string;
  startTime: Date;
  endTime: Date;
  interval: number; // minutes
  data: TimelineDataPoint[];
  visualization: {
    type: 'line' | 'bar' | 'area' | 'scatter';
    color: string;
    thickness: number;
    opacity: number;
  };
}

export interface TimelineDataPoint {
  timestamp: Date;
  value: number;
  label: string;
  color: string;
  size: number;
}

export interface WeatherMapLayer {
  id: string;
  name: string;
  type: 'temperature' | 'precipitation' | 'wind' | 'pressure' | 'clouds' | 'humidity';
  opacity: number; // 0-1
  visible: boolean;
  data: {
    url: string;
    format: 'png' | 'jpg' | 'webp' | 'svg';
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  };
  style: {
    colorScheme: string;
    minValue: number;
    maxValue: number;
    interpolation: 'linear' | 'logarithmic' | 'exponential';
  };
}

export interface VisualizationSettings {
  animations: {
    enabled: boolean;
    speed: 'slow' | 'normal' | 'fast';
    quality: 'low' | 'medium' | 'high';
    batteryOptimization: boolean;
  };
  soundscapes: {
    enabled: boolean;
    volume: number;
    autoPlay: boolean;
    fadeIn: number;
    fadeOut: number;
  };
  ar: {
    enabled: boolean;
    showOverlays: boolean;
    dataPoints: string[];
    visualStyle: 'minimal' | 'detailed' | 'artistic';
  };
  timeline: {
    enabled: boolean;
    duration: number; // hours
    interval: number; // minutes
    showTrends: boolean;
    showForecasts: boolean;
  };
  maps: {
    enabled: boolean;
    layers: string[];
    opacity: number;
    showLegend: boolean;
    showControls: boolean;
  };
}
