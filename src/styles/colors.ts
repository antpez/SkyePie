export const colors = {
  // Primary colors
  primary: '#2196F3',
  primaryDark: '#1976D2',
  primaryLight: '#BBDEFB',
  
  // Secondary colors
  secondary: '#FF9800',
  secondaryDark: '#F57C00',
  secondaryLight: '#FFE0B2',
  
  // Weather-specific colors
  sunny: '#FFC107',
  cloudy: '#9E9E9E',
  rainy: '#2196F3',
  snowy: '#E1F5FE',
  stormy: '#424242',
  
  // Temperature colors
  hot: '#F44336',
  warm: '#FF9800',
  mild: '#4CAF50',
  cool: '#2196F3',
  cold: '#9C27B0',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Background colors
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  
  // Text colors - Light theme
  onBackground: '#000000',
  onSurface: '#000000',
  onSurfaceVariant: '#000000',
  onPrimary: '#000000',
  onSecondary: '#000000',
  
  // Text colors - Dark theme
  onBackgroundDark: '#FFFFFF',
  onSurfaceDark: '#FFFFFF',
  onSurfaceVariantDark: '#FFFFFF',
  
  // Border colors
  outline: '#E0E0E0',
  outlineVariant: '#F5F5F5',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
} as const;

export type ColorKey = keyof typeof colors;
