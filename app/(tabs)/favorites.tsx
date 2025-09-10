import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, List, FAB, Snackbar, IconButton } from 'react-native-paper';
import { ConsistentCard } from '../../src/components/common';
import { router } from 'expo-router';
import { useThemeContext } from '../../src/contexts/ThemeContext';
import { useDatabase } from '../../src/contexts/DatabaseContext';
import { offlineCacheService, userService } from '../../src/services';
import { Location } from '../../src/types';

export default function FavoritesScreen() {
  const { effectiveTheme, theme } = useThemeContext();
  const { isInitialized: dbInitialized, isInitializing: dbInitializing } = useDatabase();
  const [favoriteLocations, setFavoriteLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized values for performance
  const containerStyle = useMemo(() => [
    styles.container, 
    { backgroundColor: theme.colors.background }
  ], [theme.colors.background, effectiveTheme]);


  // Load favorite locations
  const loadFavoriteLocations = useCallback(async () => {
    if (!dbInitialized) return;
    
    try {
      setIsLoading(true);
      const user = await userService.getCurrentUser();
      const favorites = await offlineCacheService.getFavoriteLocations(user.id);
      setFavoriteLocations(favorites);
    } catch (error) {
      console.error('Error loading favorite locations:', error);
      setError('Failed to load favorite locations');
      setSnackbarVisible(true);
    } finally {
      setIsLoading(false);
    }
  }, [dbInitialized]);

  // Load favorites on mount and when database is ready
  useEffect(() => {
    loadFavoriteLocations();
  }, [loadFavoriteLocations]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavoriteLocations();
    setRefreshing(false);
  }, [loadFavoriteLocations]);

  // Handle location selection
  const handleLocationSelect = useCallback((location: Location) => {
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

  // Handle remove favorite
  const handleRemoveFavorite = useCallback(async (locationId: string) => {
    try {
      await offlineCacheService.removeFavoriteLocation(locationId);
      setFavoriteLocations(prev => prev.filter(loc => loc.id !== locationId));
      setSnackbarVisible(true);
      setError(null);
    } catch (error) {
      console.error('Error removing favorite location:', error);
      setError('Failed to remove favorite location');
      setSnackbarVisible(true);
    }
  }, []);

  // Handle add new favorite
  const handleAddFavorite = useCallback(() => {
    router.navigate('/(tabs)/search');
  }, []);

  // Render location item
  const renderLocationItem = ({ item }: { item: Location }) => (
    <ConsistentCard key={`favorite-${item.id}-${effectiveTheme}`} margin="small">
      <List.Item
        title={item.name}
        description={`${item.state ? `${item.state}, ` : ''}${item.country}`}
        left={(props) => <List.Icon {...props} icon="map-marker" />}
        right={(props) => (
          <View style={styles.itemActions}>
            <IconButton
              icon="heart"
              iconColor={theme.colors.primary}
              size={20}
              onPress={() => handleLocationSelect(item)}
            />
            <IconButton
              icon="delete"
              iconColor={theme.colors.error}
              size={20}
              onPress={() => handleRemoveFavorite(item.id)}
            />
          </View>
        )}
        onPress={() => handleLocationSelect(item)}
        style={styles.locationItem}
      />
    </ConsistentCard>
  );

  // Show loading state
  if (isLoading && favoriteLocations.length === 0) {
    return (
      <View style={containerStyle} key={`favorites-loading-${effectiveTheme}`}>
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
            Loading Favorites...
          </Text>
        </View>
      </View>
    );
  }

  // Show empty state
  if (favoriteLocations.length === 0) {
    return (
      <View style={containerStyle} key={`favorites-empty-${effectiveTheme}`}>
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
            No Favorite Locations
          </Text>
          <Text variant="bodyLarge" style={[styles.emptyMessage, { color: theme.colors.onSurface }]}>
            Add locations to your favorites for quick access to weather information.
          </Text>
          <Text variant="bodyMedium" style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
            Tap the search tab to find and add locations, or use the + button below.
          </Text>
        </View>
        
        <FAB
          icon="plus"
          label="Add Favorites"
          onPress={handleAddFavorite}
          style={styles.fab}
        />

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={4000}
        >
          {error || 'Favorite location removed'}
        </Snackbar>
      </View>
    );
  }

  return (
    <View style={containerStyle} key={`favorites-${effectiveTheme}`}>
      <FlatList
        data={favoriteLocations}
        renderItem={renderLocationItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        label="Add Favorites"
        onPress={handleAddFavorite}
        style={styles.fab}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
      >
        {error || 'Favorite location removed'}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Space for FAB
  },
  locationItem: {
    paddingVertical: 8,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  emptyMessage: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
