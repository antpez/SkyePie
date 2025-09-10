import React, { createContext, useContext, ReactNode } from 'react';
import { useAccessibility } from '../hooks/useAccessibility';

interface AccessibilityContextType {
  config: any;
  isInitialized: boolean;
  shouldReduceMotion: () => boolean;
  shouldReduceTransparency: () => boolean;
  isScreenReaderActive: () => boolean;
  shouldUseHighContrast: () => boolean;
  shouldUseBoldText: () => boolean;
  isGrayscaleMode: () => boolean;
  getFontSize: (baseSize: number) => number;
  getMinTouchTargetSize: () => number;
  generateWeatherAccessibilityLabel: (weather: any) => string;
  generateForecastAccessibilityLabel: (forecast: any) => string;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const accessibility = useAccessibility();

  return (
    <AccessibilityContext.Provider value={accessibility}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibilityContext(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  return context;
}
