import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import { router } from 'expo-router';
import { LocationSearch } from '../../src/components';
import { UniversalHeader } from '../../src/components/common';
import { useOfflineWeather } from '../../src/hooks/useOfflineWeather';
import { useThemeContext } from '../../src/contexts/ThemeContext';
import { LocationSearchResult, SearchHistoryItem, Location } from '../../src/types';
import { APP_CONFIG } from '../../src/config/app';
import { offlineCacheService } from '../../src/services';

export default function SearchScreen() {
  const { effectiveTheme, theme } = useThemeContext();
  
  // Get API key from config
  const API_KEY = APP_CONFIG.api.openWeatherMap.apiKey;
  
  const { searchLocations, userId } = useOfflineWeather(API_KEY);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [favoriteLocations, setFavoriteLocations] = useState<LocationSearchResult[]>([]);

  // Memoized values for performance
  const snackbarMessage = useMemo(() => {
    if (error) return error;
    if (successMessage) return successMessage;
    return 'An error occurred while searching.';
  }, [error, successMessage]);
  const containerStyle = useMemo(() => [styles.container, { backgroundColor: theme.colors.background }], [theme.colors.background, effectiveTheme]);

  // Load search history
  const loadSearchHistory = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoadingHistory(true);
      const history = await offlineCacheService.getSearchHistory(userId);
      setSearchHistory(history);
    } catch (error) {
      console.error('Error loading search history:', error);
      setSearchHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [userId]);

  // Load favorite locations
  const loadFavoriteLocations = useCallback(async () => {
    if (!userId) return;
    
    try {
      const favorites = await offlineCacheService.getFavoriteLocations(userId);
      // Convert Location[] to LocationSearchResult[]
      const favoriteSearchResults: LocationSearchResult[] = favorites.map(fav => ({
        name: fav.name,
        country: fav.country,
        state: fav.state,
        latitude: fav.latitude,
        longitude: fav.longitude,
        displayName: `${fav.name}${fav.state ? `, ${fav.state}` : ''}, ${fav.country}`,
      }));
      setFavoriteLocations(favoriteSearchResults);
    } catch (error) {
      console.error('Error loading favorite locations:', error);
    }
  }, [userId]);

  // Load search history on mount and when user changes
  useEffect(() => {
    loadSearchHistory();
    loadFavoriteLocations();
  }, [loadSearchHistory, loadFavoriteLocations]);

  const handleSearch = useCallback(async (query: string): Promise<LocationSearchResult[]> => {
    if (!query.trim()) {
      return [];
    }

    setError(null);

    try {
      const results = await searchLocations(query);
      
      // Save search to history if we have results and a user
      if (results.length > 0 && userId) {
        try {
          // Generate a location ID based on coordinates
          const locationId = `${results[0].latitude}-${results[0].longitude}`;
          await offlineCacheService.saveSearchHistory(query, locationId, userId);
          // Reload history to show the new search
          await loadSearchHistory();
        } catch (historyError) {
          console.error('Error saving search history:', historyError);
        }
      }
      
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      setSnackbarVisible(true);
      return [];
    }
  }, [searchLocations, userId, loadSearchHistory]);

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

  const handleClearHistory = useCallback(async () => {
    if (!userId) return;
    
    try {
      await offlineCacheService.clearSearchHistory(userId);
      setSearchHistory([]);
      setError(null);
      setSuccessMessage('Search history cleared');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error clearing search history:', error);
      setError('Failed to clear search history');
      setSnackbarVisible(true);
    }
  }, [userId]);

  const handleHistoryItemPress = useCallback(async (historyItem: SearchHistoryItem) => {
    // Trigger search with the history item query
    try {
      const results = await handleSearch(historyItem.query);
      if (results.length > 0) {
        // Auto-select the first result
        handleLocationSelect(results[0]);
      }
    } catch (error) {
      console.error('Error searching from history:', error);
    }
  }, [handleSearch, handleLocationSelect]);

  const handleAddToFavorites = useCallback(async (location: LocationSearchResult) => {
    if (!userId) return;
    
    try {
      // Convert LocationSearchResult to Location format
      const locationToSave: Omit<Location, 'id' | 'createdAt' | 'updatedAt'> = {
        userId,
        name: location.name,
        country: location.country,
        state: location.state,
        latitude: location.latitude,
        longitude: location.longitude,
        isCurrent: false,
        isFavorite: true,
        searchCount: 0,
        lastSearched: new Date(),
      };
      
      await offlineCacheService.addFavoriteLocation(locationToSave, userId);
      // Refresh favorite locations list
      await loadFavoriteLocations();
      setError(null);
      setSuccessMessage(`Added ${location.name} to favorites!`);
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      setError('Failed to add to favorites');
      setSnackbarVisible(true);
    }
  }, [userId, loadFavoriteLocations]);

  const handleRemoveFromFavorites = useCallback(async (location: LocationSearchResult) => {
    if (!userId) return;
    
    try {
      // Find the location in favorites by coordinates
      const favorites = await offlineCacheService.getFavoriteLocations(userId);
      const favoriteToRemove = favorites.find(fav => 
        Math.abs(fav.latitude - location.latitude) < 0.0001 &&
        Math.abs(fav.longitude - location.longitude) < 0.0001
      );
      
      if (favoriteToRemove) {
        await offlineCacheService.removeFavoriteLocation(favoriteToRemove.id);
        // Refresh favorite locations list
        await loadFavoriteLocations();
        setError(null);
        setSuccessMessage(`Removed ${location.name} from favorites`);
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      setError('Failed to remove from favorites');
      setSnackbarVisible(true);
    }
  }, [userId, loadFavoriteLocations]);


  return (
    <View style={containerStyle} key={`search-${effectiveTheme}`}>
      {/* Universal Header */}
      <UniversalHeader 
        title="Search" 
        backgroundColor={theme.colors.background}
        textColor={theme.colors.onSurface}
      />
      
      <LocationSearch
        key={`location-search-${effectiveTheme}`}
        onLocationSelect={handleLocationSelect}
        onSearch={handleSearch}
        searchHistory={searchHistory}
        onClearHistory={handleClearHistory}
        onHistoryItemPress={handleHistoryItemPress}
        onAddToFavorites={handleAddToFavorites}
        onRemoveFromFavorites={handleRemoveFromFavorites}
        favoriteLocations={favoriteLocations}
        placeholder="Search for a city or location..."
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          setSnackbarVisible(false);
          setError(null);
          setSuccessMessage(null);
        }}
        duration={4000}
        style={{ backgroundColor: theme.colors.error }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100, // Space for UniversalHeader
  },
});
