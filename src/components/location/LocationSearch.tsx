import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Searchbar, Card, Text, List } from 'react-native-paper';
import { useThemeContext } from '../../contexts/ThemeContext';
import { LocationSearchResult, SearchHistoryItem } from '../../types';
import { debounce } from '../../utils/helpers';

interface LocationSearchProps {
  onLocationSelect: (location: LocationSearchResult) => void;
  onSearch: (query: string) => Promise<LocationSearchResult[]>;
  searchHistory?: SearchHistoryItem[];
  onClearHistory?: () => void;
  placeholder?: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  onSearch,
  searchHistory = [],
  onClearHistory,
  placeholder = 'Enter city or location',
}) => {
  const { effectiveTheme, theme } = useThemeContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
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
    }, 300),
    [onSearch]
  );

  const handleQueryChange = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  const handleLocationSelect = (location: LocationSearchResult) => {
    onLocationSelect(location);
    setQuery('');
    setResults([]);
    setShowHistory(false);
  };

  const handleHistoryItemPress = (historyItem: SearchHistoryItem) => {
    // Trigger search with the history item query
    if (onSearch) {
      onSearch(historyItem.query);
    }
  };

  const renderSearchResult = ({ item }: { item: LocationSearchResult }) => (
    <List.Item
      title={item.name}
      description={`${item.state ? `${item.state}, ` : ''}${item.country}`}
      left={(props) => <List.Icon {...props} icon="map-marker" />}
      onPress={() => handleLocationSelect(item)}
      style={styles.resultItem}
    />
  );

  const renderHistoryItem = ({ item }: { item: SearchHistoryItem }) => (
    <List.Item
      title={item.query}
      left={(props) => <List.Icon {...props} icon="history" />}
      onPress={() => handleHistoryItemPress(item)}
      style={styles.historyItem}
    />
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={placeholder}
        value={query}
        onChangeText={handleQueryChange}
        loading={isSearching}
        style={styles.searchbar}
      />
      
      {(showHistory || results.length > 0) && (
        <Card style={[styles.resultsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.resultsContent}>
            {showHistory && searchHistory.length > 0 && (
              <>
                <View style={[styles.sectionHeader, { borderBottomColor: theme.colors.outline }]}>
                  <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>Recent Searches</Text>
                  {onClearHistory && (
                    <Text 
                      variant="bodySmall" 
                      style={[styles.clearButton, { color: theme.colors.primary }]}
                      onPress={onClearHistory}
                    >
                      Clear
                    </Text>
                  )}
                </View>
                <FlatList
                  data={searchHistory.slice(0, 5)}
                  renderItem={renderHistoryItem}
                  keyExtractor={(item) => item.id}
                  style={styles.historyList}
                />
              </>
            )}
            
            {results.length > 0 && (
              <>
                <View style={[styles.sectionHeader, { borderBottomColor: theme.colors.outline }]}>
                  <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>Search Results</Text>
                </View>
                <FlatList
                  data={results}
                  renderItem={renderSearchResult}
                  keyExtractor={(item, index) => `${item.latitude}-${item.longitude}-${index}`}
                  style={styles.resultsList}
                />
              </>
            )}
          </Card.Content>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  resultsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  resultsContent: {
    padding: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  clearButton: {
    // Color will be set dynamically in component
  },
  resultsList: {
    maxHeight: 200,
  },
  historyList: {
    maxHeight: 150,
  },
  resultItem: {
    paddingHorizontal: 16,
  },
  historyItem: {
    paddingHorizontal: 16,
  },
});
