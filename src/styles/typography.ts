import { Platform } from 'react-native';
import { fontSizes, lineHeights } from './spacing';

export const fontFamilies = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
  light: Platform.select({
    ios: 'System',
    android: 'Roboto-Light',
    default: 'System',
  }),
} as const;

export const typography = {
  // Display styles - More modern and bold
  displayLarge: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.largeDisplay,
    lineHeight: lineHeights.largeDisplay,
    letterSpacing: -0.5,
    fontWeight: '700',
  },
  displayMedium: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.display,
    lineHeight: lineHeights.display,
    letterSpacing: -0.25,
    fontWeight: '600',
  },
  displaySmall: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xxxl,
    lineHeight: lineHeights.xxxl,
    letterSpacing: 0,
    fontWeight: '600',
  },
  
  // Headline styles - Better hierarchy
  headlineLarge: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xxxl,
    lineHeight: lineHeights.xxxl,
    letterSpacing: -0.25,
    fontWeight: '700',
  },
  headlineMedium: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xxl,
    lineHeight: lineHeights.xxl,
    letterSpacing: 0,
    fontWeight: '600',
  },
  headlineSmall: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.xl,
    letterSpacing: 0,
    fontWeight: '600',
  },
  
  // Title styles - More prominent
  titleLarge: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    letterSpacing: 0,
    fontWeight: '700',
  },
  titleMedium: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    letterSpacing: 0.1,
    fontWeight: '600',
  },
  titleSmall: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    letterSpacing: 0.1,
    fontWeight: '600',
  },
  
  // Body styles - Improved readability
  bodyLarge: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.lg,
    letterSpacing: 0.1,
    fontWeight: '400',
  },
  bodyMedium: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.md,
    letterSpacing: 0.15,
    fontWeight: '400',
  },
  bodySmall: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.sm,
    letterSpacing: 0.25,
    fontWeight: '400',
  },
  
  // Label styles - More distinct
  labelLarge: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    letterSpacing: 0.1,
    fontWeight: '600',
  },
  labelMedium: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  labelSmall: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  
  // Additional modern styles
  caption: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    letterSpacing: 0.4,
    fontWeight: '400',
  },
  overline: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    letterSpacing: 1.5,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
} as const;

export type TypographyKey = keyof typeof typography;
