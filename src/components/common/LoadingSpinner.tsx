import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { ActivityIndicator, Text, ProgressBar } from 'react-native-paper';
import { useThemeContext } from '../../contexts/ThemeContext';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  progress?: number;
  showProgress?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'large',
  color,
  progress,
  showProgress = false,
}) => {
  const { effectiveTheme, theme } = useThemeContext();

  return (
    <View style={styles.container}>
      <ActivityIndicator 
        size={size} 
        color={color || theme.colors.primary} 
      />
      {message && (
        <Text style={[styles.message, { color: theme.colors.onSurface }]}>
          {message}
        </Text>
      )}
      {showProgress && progress !== undefined && (
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={progress} 
            color={theme.colors.primary}
            style={styles.progressBar}
          />
          <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginTop: 16,
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
  },
});
