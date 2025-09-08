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
  // Display styles
  displayLarge: {
    fontFamily: fontFamilies.light,
    fontSize: fontSizes.largeDisplay,
    lineHeight: lineHeights.largeDisplay,
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontFamily: fontFamilies.light,
    fontSize: fontSizes.display,
    lineHeight: lineHeights.display,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xxxl,
    lineHeight: lineHeights.xxxl,
    letterSpacing: 0,
  },
  
  // Headline styles
  headlineLarge: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xxxl,
    lineHeight: lineHeights.xxxl,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xxl,
    lineHeight: lineHeights.xxl,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.xl,
    letterSpacing: 0,
  },
  
  // Title styles
  titleLarge: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    letterSpacing: 0.1,
  },
  
  // Body styles
  bodyLarge: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.lg,
    letterSpacing: 0.15,
  },
  bodyMedium: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.md,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.sm,
    letterSpacing: 0.4,
  },
  
  // Label styles
  labelLarge: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    letterSpacing: 0.5,
  },
} as const;

export type TypographyKey = keyof typeof typography;
