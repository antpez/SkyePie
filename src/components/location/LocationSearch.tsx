import React, { useState, useCallback, memo } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Searchbar, Text, List, IconButton } from 'react-native-paper';
import { useThemeContext } from '../../contexts/ThemeContext';
import { LocationSearchResult, SearchHistoryItem } from '../../types';
import { debounce } from '../../utils/helpers';

interface LocationSearchProps {
  onLocationSelect: (location: LocationSearchResult) => void;
  onSearch: (query: string) => Promise<LocationSearchResult[]>;
  searchHistory?: SearchHistoryItem[];
  onClearHistory?: () => void;
  onHistoryItemPress?: (historyItem: SearchHistoryItem) => void;
  onAddToFavorites?: (location: LocationSearchResult) => void;
  onRemoveFromFavorites?: (location: LocationSearchResult) => void;
  favoriteLocations?: LocationSearchResult[];
  placeholder?: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = memo(({
  onLocationSelect,
  onSearch,
  searchHistory = [],
  onClearHistory,
  onHistoryItemPress,
  onAddToFavorites,
  onRemoveFromFavorites,
  favoriteLocations = [],
  placeholder = 'Enter city or location',
}) => {
  const { effectiveTheme, theme } = useThemeContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 1) {
        setResults([]);
        setShowHistory(true);
        return;
      }

      setIsSearching(true);
      try {
        const searchResults = await onSearch(searchQuery);
        setResults(searchResults);
        setShowHistory(false);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200), // Reduced debounce delay for faster search
    [onSearch]
  );

  const handleQueryChange = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  const handleScroll = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const handleLocationSelect = (location: LocationSearchResult) => {
    onLocationSelect(location);
    setQuery('');
    setResults([]);
    setShowHistory(false);
  };

  const handleHistoryItemPress = (historyItem: SearchHistoryItem) => {
    // Use the provided handler or fallback to triggering search
    if (onHistoryItemPress) {
      onHistoryItemPress(historyItem);
    } else if (onSearch) {
      onSearch(historyItem.query);
    }
  };

  // Check if a location is in favorites
  const isFavorite = (location: LocationSearchResult): boolean => {
    return favoriteLocations.some(fav => 
      Math.abs(fav.latitude - location.latitude) < 0.0001 &&
      Math.abs(fav.longitude - location.longitude) < 0.0001
    );
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (location: LocationSearchResult) => {
    if (isFavorite(location)) {
      onRemoveFromFavorites?.(location);
    } else {
      onAddToFavorites?.(location);
    }
  };

  const renderSearchResult = ({ item }: { item: LocationSearchResult }) => {
    const isItemFavorite = isFavorite(item);
    
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          // Immediately select location and dismiss keyboard
          handleLocationSelect(item);
          Keyboard.dismiss();
        }}
      >
        <View>
          <List.Item
            title={item.name}
            description={`${item.state ? `${item.state}, ` : ''}${item.country}`}
            left={(props) => <List.Icon {...props} icon="map-marker" />}
            right={(props) => (
              <View style={styles.resultActions}>
                {(onAddToFavorites || onRemoveFromFavorites) && (
                  <IconButton
                    icon={isItemFavorite ? "heart" : "heart-outline"}
                    iconColor={isItemFavorite ? theme.colors.error : theme.colors.primary}
                    size={20}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleFavoriteToggle(item);
                    }}
                    accessibilityLabel={isItemFavorite ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
                  />
                )}
              </View>
            )}
            style={styles.resultItemContent}
            accessibilityLabel={`Select ${item.name}, ${item.state ? `${item.state}, ` : ''}${item.country}`}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const renderHistoryItem = ({ item }: { item: SearchHistoryItem }) => (
    <List.Item
      title={item.query}
      left={(props) => <List.Icon {...props} icon="history" />}
      onPress={() => handleHistoryItemPress(item)}
      style={styles.historyItem}
    />
  );

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <Searchbar
        placeholder={placeholder}
        value={query}
        onChangeText={handleQueryChange}
        loading={isSearching}
        style={styles.searchbar}
      />
      
      {(showHistory || results.length > 0) && (
        <View style={styles.resultsContainer}>
          {showHistory && searchHistory.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Recent Searches
                </Text>
                {onClearHistory && (
                  <Text 
                    variant="bodyMedium" 
                    style={[styles.clearButton, { color: theme.colors.primary }]}
                    onPress={onClearHistory}
                  >
                    Clear
                  </Text>
                )}
              </View>
              <View style={styles.historyContainer}>
                {searchHistory.slice(0, 5).map((item) => (
                  <View key={item.id} style={[styles.historyItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <List.Item
                      title={item.query}
                      left={(props) => <List.Icon {...props} icon="history" />}
                      onPress={() => handleHistoryItemPress(item)}
                      style={styles.historyItemContent}
                    />
                  </View>
                ))}
              </View>
            </>
          )}
          
          {isSearching && (
            <View style={styles.loadingContainer}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Searching...
              </Text>
            </View>
          )}
          
          {results.length > 0 && !isSearching && (
            <>
              <View style={styles.sectionHeader}>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Search Results
                </Text>
              </View>
              <View style={styles.resultsListContainer}>
                {results.map((item, index) => (
                  <View key={`${item.latitude}-${item.longitude}-${index}`} style={[styles.resultItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                    {renderSearchResult({ item })}
                  </View>
                ))}
              </View>
            </>
          )}
          
          {!isSearching && query.length >= 1 && results.length === 0 && (
            <View style={styles.noResultsContainer}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                No locations found for "{query}"
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  resultsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: 18,
  },
  clearButton: {
    fontWeight: '500',
  },
  historyContainer: {
    gap: 12,
    marginBottom: 24,
  },
  historyItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  historyItemContent: {
    paddingHorizontal: 16,
  },
  resultsListContainer: {
    gap: 12,
  },
  resultItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  resultItemContent: {
    paddingHorizontal: 16,
  },
  resultActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noResultsContainer: {
    padding: 16,
    alignItems: 'center',
  },
});

LocationSearch.displayName = 'LocationSearch';
