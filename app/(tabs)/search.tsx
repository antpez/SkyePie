import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import { router } from 'expo-router';
import { LocationSearch } from '../../src/components';
import { useWeather } from '../../src/hooks';
import { useThemeContext } from '../../src/contexts/ThemeContext';
import { LocationSearchResult } from '../../src/types';
import { APP_CONFIG } from '../../src/config/app';

export default function SearchScreen() {
  const { effectiveTheme, theme } = useThemeContext();
  
  // Get API key from config
  const API_KEY = APP_CONFIG.api.openWeatherMap.apiKey;
  
  const { searchLocations } = useWeather(API_KEY);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized values for performance
  const snackbarMessage = useMemo(() => error || 'An error occurred while searching.', [error]);
  const containerStyle = useMemo(() => [styles.container, { backgroundColor: theme.colors.background }], [theme.colors.background, effectiveTheme]);

  const handleSearch = useCallback(async (query: string): Promise<LocationSearchResult[]> => {
    if (!query.trim()) {
      return [];
    }

    setError(null);

    try {
      const results = await searchLocations(query);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      setSnackbarVisible(true);
      return [];
    }
  }, [searchLocations]);

  const handleLocationSelect = useCallback((location: LocationSearchResult) => {
    // Navigate to weather screen with selected location
    // Navigate to the weather tab with location parameters
    router.navigate({
      pathname: '/(tabs)/',
      params: {
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        name: location.name,
        country: location.country,
        state: location.state || '',
      }
    });
  }, []);

  const handleClearHistory = useCallback(() => {
    // Clear search history - this would typically call a service to clear stored history
    // For now, we'll just show a message since the history is managed by the LocationSearch component
    setSnackbarVisible(true);
    setError('Search history cleared');
  }, []);


  return (
    <View style={containerStyle} key={`search-${effectiveTheme}`}>
      <LocationSearch
        key={`location-search-${effectiveTheme}`}
        onLocationSelect={handleLocationSelect}
        onSearch={handleSearch}
        onClearHistory={handleClearHistory}
        placeholder="Search for a city or location..."
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
