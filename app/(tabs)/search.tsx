import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Snackbar, Button } from 'react-native-paper';
import { router, useRouter, useLocalSearchParams } from 'expo-router';
import { LocationSearch } from '@/components';
import { UniversalHeader } from '@/components/common';
import { useOfflineWeather } from '@/hooks/useOfflineWeather';
import { useThemeContext } from '@/contexts/ThemeContext';
import { LocationSearchResult, SearchHistoryItem, Location } from '@/types';
import { APP_CONFIG } from '@/config/app';
import { offlineCacheService } from '@/services';

export default function SearchScreen() {
  const { effectiveTheme, theme } = useThemeContext();
  const navigation = useRouter();
  
  // Get API key from config
  const API_KEY = APP_CONFIG.api.openWeatherMap.apiKey;
  
  const { searchLocations, userId } = useOfflineWeather(API_KEY);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [favoriteLocations, setFavoriteLocations] = useState<LocationSearchResult[]>([]);

  // Memoized values for performance
  const snackbarMessage = useMemo(() => {
    if (error) return error;
    if (successMessage) return successMessage;
    return 'An error occurred while searching.';
  }, [error, successMessage]);
  const containerStyle = useMemo(() => [styles.container, { backgroundColor: theme.colors.background }], [theme.colors.background, effectiveTheme]);

  // Utility function for coordinate comparison
  const areCoordinatesEqual = useCallback((lat1: number, lon1: number, lat2: number, lon2: number, tolerance = 0.0001) => {
    return Math.abs(lat1 - lat2) < tolerance && Math.abs(lon1 - lon2) < tolerance;
  }, []);

  // Load search history
  const loadSearchHistory = useCallback(async () => {
    if (!userId) return;
    
    try {
      const history = await offlineCacheService.getSearchHistory(userId);
      setSearchHistory(history);
    } catch (error) {
      console.error('Error loading search history:', error);
      setSearchHistory([]);
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
  }, [userId]); // Only depend on userId, not the functions

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
          // Update history state directly instead of reloading
          setSearchHistory(prev => [
            {
              id: Date.now().toString(),
              query,
              locationId,
              searchType: 'manual' as const,
              searchedAt: new Date(),
              createdAt: new Date(),
            },
            ...prev.slice(0, 9) // Keep only 10 most recent
          ]);
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
  }, [searchLocations, userId]);

  const handleLocationSelect = useCallback((location: LocationSearchResult) => {
    // Validate location data
    if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      setError('Invalid location data');
      setSnackbarVisible(true);
      return;
    }

    try {
      console.log('🔍 Location selected from search:', location.name, location.latitude, location.longitude);
      
      // Try multiple navigation methods
      const navigationParams = {
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        name: location.name || 'Unknown Location',
        country: location.country || '',
        state: location.state || '',
      };
      
      // Method 1: Try using href format
      const href = `/(tabs)/?latitude=${navigationParams.latitude}&longitude=${navigationParams.longitude}&name=${encodeURIComponent(navigationParams.name)}&country=${encodeURIComponent(navigationParams.country)}&state=${encodeURIComponent(navigationParams.state)}`;
      
      console.log('🔍 Navigating to:', href);
      
      try {
        navigation.replace(href);
        return;
      } catch (replaceError) {
        console.log('🔍 Replace failed, trying push:', replaceError);
        // Fallback to push if replace fails
        navigation.push(href);
      }
      
    } catch (error) {
      console.error('Navigation failed:', error);
      setError('Failed to navigate to location');
      setSnackbarVisible(true);
    }
  }, [navigation]);

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
      // Update favorites state directly instead of reloading
      setFavoriteLocations(prev => [
        {
          name: location.name,
          country: location.country,
          state: location.state,
          latitude: location.latitude,
          longitude: location.longitude,
          displayName: `${location.name}${location.state ? `, ${location.state}` : ''}, ${location.country}`,
        },
        ...prev
      ]);
      setError(null);
      setSuccessMessage(`Added ${location.name} to favorites!`);
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      setError('Failed to add to favorites');
      setSnackbarVisible(true);
    }
  }, [userId]);

  const handleRemoveFromFavorites = useCallback(async (location: LocationSearchResult) => {
    if (!userId) return;
    
    try {
      // Find the location in favorites by coordinates
      const favorites = await offlineCacheService.getFavoriteLocations(userId);
      const favoriteToRemove = favorites.find(fav => 
        areCoordinatesEqual(fav.latitude, fav.longitude, location.latitude, location.longitude)
      );
      
      if (favoriteToRemove) {
        await offlineCacheService.removeFavoriteLocation(favoriteToRemove.id);
        // Update favorites state directly instead of reloading
        setFavoriteLocations(prev => 
          prev.filter(fav => 
            !areCoordinatesEqual(fav.latitude, fav.longitude, location.latitude, location.longitude)
          )
        );
        setError(null);
        setSuccessMessage(`Removed ${location.name} from favorites`);
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      setError('Failed to remove from favorites');
      setSnackbarVisible(true);
    }
  }, [userId, areCoordinatesEqual]);


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
