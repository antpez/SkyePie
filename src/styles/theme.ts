import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { colors } from './colors';
import { spacing } from './spacing';
import { borderRadius } from './spacing';
import { typography } from './typography';

const fontConfig = {
  displayLarge: typography.displayLarge,
  displayMedium: typography.displayMedium,
  displaySmall: typography.displaySmall,
  headlineLarge: typography.headlineLarge,
  headlineMedium: typography.headlineMedium,
  headlineSmall: typography.headlineSmall,
  titleLarge: typography.titleLarge,
  titleMedium: typography.titleMedium,
  titleSmall: typography.titleSmall,
  bodyLarge: typography.bodyLarge,
  bodyMedium: typography.bodyMedium,
  bodySmall: typography.bodySmall,
  labelLarge: typography.labelLarge,
  labelMedium: typography.labelMedium,
  labelSmall: typography.labelSmall,
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryLight,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    background: colors.background,
    error: colors.error,
    onPrimary: colors.onPrimary,
    onSecondary: colors.onSecondary,
    onSurface: colors.onSurface,
    onSurfaceVariant: colors.onSurfaceVariant,
    onBackground: colors.onBackground,
    outline: colors.outline,
    outlineVariant: colors.outlineVariant,
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: borderRadius.md,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryDark,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryDark,
    surface: colors.gray800,
    surfaceVariant: colors.gray700,
    background: colors.gray900,
    error: colors.error,
    onPrimary: colors.onPrimary,
    onSecondary: colors.onSecondary,
    onSurface: colors.onSurfaceDark,
    onSurfaceVariant: colors.onSurfaceVariantDark,
    onBackground: colors.onBackgroundDark,
    outline: colors.gray600,
    outlineVariant: colors.gray700,
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: borderRadius.md,
};

export const customSpacing = {
  ...spacing,
  borderRadius,
};

export type AppTheme = typeof lightTheme;
export type ThemeMode = 'light' | 'dark' | 'system';
