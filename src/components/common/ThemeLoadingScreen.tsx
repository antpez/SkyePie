import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import { useThemeContext } from '../../contexts/ThemeContext';
import { useAppInitialization } from '../../hooks/useAppInitialization';

interface ThemeLoadingScreenProps {
  children: React.ReactNode;
}

export const ThemeLoadingScreen: React.FC<ThemeLoadingScreenProps> = ({ children }) => {
  const { isLoading, isInitialized } = useThemeContext();
  const appInitState = useAppInitialization();

  // Show loading screen until both theme and app are fully initialized
  const showLoading = isLoading || !isInitialized || appInitState.isInitializing;

  if (showLoading) {
    const progress = Object.values(appInitState.progress).filter(Boolean).length / 4;
    const progressText = appInitState.error ? 'Error initializing...' : 'Loading SkyePie...';

    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.text}>{progressText}</Text>
        <ProgressBar 
          progress={progress} 
          color="#007AFF" 
          style={styles.progressBar}
        />
        {appInitState.error && (
          <Text style={styles.errorText}>{appInitState.error}</Text>
        )}
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    marginTop: 16,
    height: 4,
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
  },
});
