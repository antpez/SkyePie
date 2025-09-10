import { useState, useEffect, useCallback } from 'react';
import { accessibilityManager, AccessibilityConfig } from '../utils/accessibility';

export function useAccessibility() {
  const [config, setConfig] = useState<AccessibilityConfig>(accessibilityManager.getConfig());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAccessibility = async () => {
      try {
        await accessibilityManager.initialize();
        setConfig(accessibilityManager.getConfig());
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing accessibility:', error);
        setIsInitialized(true); // Still mark as initialized to prevent blocking
      }
    };

    initializeAccessibility();

    // Set up listener for accessibility changes
    const unsubscribe = accessibilityManager.addListener((newConfig) => {
      setConfig(newConfig);
    });

    return unsubscribe;
  }, []);

  // Helper functions
  const shouldReduceMotion = useCallback(() => {
    return config.isReduceMotionEnabled;
  }, [config.isReduceMotionEnabled]);

  const shouldReduceTransparency = useCallback(() => {
    return config.isReduceTransparencyEnabled;
  }, [config.isReduceTransparencyEnabled]);

  const isScreenReaderActive = useCallback(() => {
    return config.isScreenReaderEnabled;
  }, [config.isScreenReaderEnabled]);

  const shouldUseHighContrast = useCallback(() => {
    return config.isHighContrastEnabled || config.isInvertColorsEnabled;
  }, [config.isHighContrastEnabled, config.isInvertColorsEnabled]);

  const shouldUseBoldText = useCallback(() => {
    return config.isBoldTextEnabled;
  }, [config.isBoldTextEnabled]);

  const isGrayscaleMode = useCallback(() => {
    return config.isGrayscaleEnabled;
  }, [config.isGrayscaleEnabled]);

  const getFontSize = useCallback((baseSize: number) => {
    return accessibilityManager.getFontSize(baseSize);
  }, []);

  const getMinTouchTargetSize = useCallback(() => {
    return accessibilityManager.getMinTouchTargetSize();
  }, []);

  const generateWeatherAccessibilityLabel = useCallback((weather: any) => {
    return accessibilityManager.generateWeatherAccessibilityLabel(weather);
  }, []);

  const generateForecastAccessibilityLabel = useCallback((forecast: any) => {
    return accessibilityManager.generateForecastAccessibilityLabel(forecast);
  }, []);

  return {
    config,
    isInitialized,
    shouldReduceMotion,
    shouldReduceTransparency,
    isScreenReaderActive,
    shouldUseHighContrast,
    shouldUseBoldText,
    isGrayscaleMode,
    getFontSize,
    getMinTouchTargetSize,
    generateWeatherAccessibilityLabel,
    generateForecastAccessibilityLabel,
  };
}
