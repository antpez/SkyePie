import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useThemeContext } from '../src/contexts/ThemeContext';
import { router } from 'expo-router';

export default function NotFoundScreen() {
  const { effectiveTheme, theme } = useThemeContext();

  const handleGoHome = () => {
    router.replace('/');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text variant="displaySmall" style={[styles.title, { color: theme.colors.onSurface }]}>
          404
        </Text>
        <Text variant="headlineSmall" style={[styles.subtitle, { color: theme.colors.onSurface }]}>
          Page Not Found
        </Text>
        <Text variant="bodyLarge" style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
          The page you're looking for doesn't exist.
        </Text>
        <Button
          mode="contained"
          onPress={handleGoHome}
          style={styles.button}
        >
          Go Home
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  button: {
    marginTop: 16,
  },
});
