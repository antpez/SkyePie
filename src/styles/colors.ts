export const colors = {
  // Primary colors - Modern blue gradient
  primary: '#667eea',
  primaryDark: '#5a67d8',
  primaryLight: '#a5b4fc',
  primaryGradient: ['#667eea', '#764ba2'],
  
  // Secondary colors - Modern orange gradient
  secondary: '#f093fb',
  secondaryDark: '#f5576c',
  secondaryLight: '#f8b4d9',
  secondaryGradient: ['#f093fb', '#f5576c'],
  
  // Weather-specific colors with gradients
  sunny: '#ffecd2',
  sunnyGradient: ['#fcb69f', '#ffecd2'],
  cloudy: '#a8edea',
  cloudyGradient: ['#a8edea', '#fed6e3'],
  rainy: '#a8c8ec',
  rainyGradient: ['#a8c8ec', '#d299c2'],
  snowy: '#e0c3fc',
  snowyGradient: ['#e0c3fc', '#9bb5ff'],
  stormy: '#667eea',
  stormyGradient: ['#667eea', '#764ba2'],
  
  // Temperature colors with gradients
  hot: '#ff9a9e',
  hotGradient: ['#ff9a9e', '#fecfef'],
  warm: '#ffecd2',
  warmGradient: ['#fcb69f', '#ffecd2'],
  mild: '#a8edea',
  mildGradient: ['#a8edea', '#fed6e3'],
  cool: '#a8c8ec',
  coolGradient: ['#a8c8ec', '#d299c2'],
  cold: '#e0c3fc',
  coldGradient: ['#e0c3fc', '#9bb5ff'],
  
  // Status colors
  success: '#4ade80',
  successGradient: ['#4ade80', '#22c55e'],
  warning: '#fbbf24',
  warningGradient: ['#fbbf24', '#f59e0b'],
  error: '#f87171',
  errorGradient: ['#f87171', '#ef4444'],
  info: '#60a5fa',
  infoGradient: ['#60a5fa', '#3b82f6'],
  
  // Neutral colors - Modern grays
  white: '#FFFFFF',
  black: '#0f172a',
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  gray900: '#0f172a',
  
  // Background colors
  background: '#f8fafc',
  backgroundGradient: ['#f8fafc', '#e2e8f0'],
  surface: '#FFFFFF',
  surfaceVariant: '#f1f5f9',
  surfaceGradient: ['#ffffff', '#f8fafc'],
  
  // Text colors - Light theme
  onBackground: '#0f172a',
  onSurface: '#1e293b',
  onSurfaceVariant: '#475569',
  onPrimary: '#ffffff',
  onSecondary: '#ffffff',
  
  // Text colors - Dark theme
  onBackgroundDark: '#f8fafc',
  onSurfaceDark: '#f1f5f9',
  onSurfaceVariantDark: '#cbd5e1',
  
  // Border colors
  outline: '#e2e8f0',
  outlineVariant: '#f1f5f9',
  
  // Shadow colors
  shadow: 'rgba(15, 23, 42, 0.08)',
  shadowDark: 'rgba(15, 23, 42, 0.16)',
  shadowLight: 'rgba(15, 23, 42, 0.04)',
  
  // Modern accent colors
  accent: '#8b5cf6',
  accentGradient: ['#8b5cf6', '#a855f7'],
  accentLight: '#c4b5fd',
  
  // Glass morphism
  glass: 'rgba(255, 255, 255, 0.25)',
  glassDark: 'rgba(15, 23, 42, 0.25)',
  glassBorder: 'rgba(255, 255, 255, 0.18)',
} as const;

export type ColorKey = keyof typeof colors;
