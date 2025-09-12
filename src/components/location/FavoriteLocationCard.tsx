import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, IconButton, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeContext } from '../../contexts/ThemeContext';
import { useUnits } from '../../contexts/UnitsContext';
import { Location } from '../../types';
import { WeatherIcon } from '../weather/WeatherIcon';
import { formatTemperature } from '../../utils/formatters';
import { WeatherService } from '../../services';
import { APP_CONFIG } from '../../config/app';

interface FavoriteLocationCardProps {
  location: Location;
  onPress: (location: Location) => void;
  onRemove: (locationId: string) => void;
  onAddToFavorites?: (location: Location) => void;
}

interface WeatherPreview {
  temperature: number;
  condition: string;
  description: string;
  icon: string;
  isLoading: boolean;
  error?: string;
}

export const FavoriteLocationCard: React.FC<FavoriteLocationCardProps> = memo(({
  location,
  onPress,
  onRemove,
  onAddToFavorites
}) => {
  const { effectiveTheme, theme } = useThemeContext();
  const { units } = useUnits();
  const [weatherPreview, setWeatherPreview] = useState<WeatherPreview>({
    temperature: 0,
    condition: '',
    description: '',
    icon: '',
    isLoading: true
  });

  // Memoized theme styles
  const themeStyles = useMemo(() => ({
    card: [styles.card, { backgroundColor: theme.colors.surface }],
    locationName: [styles.locationName, { color: theme.colors.onSurface }],
    locationDetails: [styles.locationDetails, { color: theme.colors.onSurfaceVariant }],
    temperature: [styles.temperature, { color: theme.colors.onSurface }],
    condition: [styles.condition, { color: theme.colors.onSurfaceVariant }],
    chip: { backgroundColor: theme.colors.surfaceVariant }
  }), [theme.colors]);

  // Load weather preview for this location
  const loadWeatherPreview = useCallback(async () => {
    try {
      setWeatherPreview(prev => ({ ...prev, isLoading: true, error: undefined }));
      
      const weatherService = new WeatherService(APP_CONFIG.api.openWeatherMap.apiKey);
      const weather = await weatherService.getCurrentWeather(
        location.latitude,
        location.longitude
      );
      
      setWeatherPreview({
        temperature: weather.main.temp,
        condition: weather.weather[0]?.main || '',
        description: weather.weather[0]?.description || '',
        icon: weather.weather[0]?.icon || '',
        isLoading: false
      });
    } catch (error) {
      console.error('Error loading weather preview for', location.name, error);
      setWeatherPreview(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load weather'
      }));
    }
  }, [location.latitude, location.longitude, location.name]);

  // Load weather preview on mount
  useEffect(() => {
    loadWeatherPreview();
  }, [loadWeatherPreview]);

  // Handle card press
  const handlePress = useCallback(() => {
    onPress(location);
  }, [onPress, location]);

  // Handle remove press
  const handleRemove = useCallback(() => {
    onRemove(location.id);
  }, [onRemove, location.id]);

  // Handle add to favorites (if not already a favorite)
  const handleAddToFavorites = useCallback(() => {
    if (onAddToFavorites) {
      onAddToFavorites(location);
    }
  }, [onAddToFavorites, location]);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Card style={themeStyles.card} mode="outlined">
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <View style={styles.locationInfo}>
              <Text variant="titleMedium" style={themeStyles.locationName} numberOfLines={1}>
                {location.name}
              </Text>
              <Text variant="bodySmall" style={themeStyles.locationDetails} numberOfLines={1}>
                {location.state ? `${location.state}, ` : ''}{location.country}
              </Text>
            </View>
            
            <View style={styles.actions}>
              {onAddToFavorites && (
                <IconButton
                  icon="heart-plus"
                  iconColor={theme.colors.primary}
                  size={20}
                  onPress={handleAddToFavorites}
                />
              )}
              <IconButton
                icon="delete"
                iconColor={theme.colors.error}
                size={20}
                onPress={handleRemove}
              />
            </View>
          </View>

          <View style={styles.weatherPreview}>
            {weatherPreview.isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text variant="bodySmall" style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
                  Loading weather...
                </Text>
              </View>
            ) : weatherPreview.error ? (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons 
                  name="weather-cloudy-alert" 
                  size={24} 
                  color={theme.colors.error} 
                />
                <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                  {weatherPreview.error}
                </Text>
              </View>
            ) : (
              <View style={styles.weatherInfo}>
                <View style={styles.weatherMain}>
                  <WeatherIcon
                    condition={{
                      id: 0, // Default ID for weather condition
                      main: weatherPreview.condition,
                      description: weatherPreview.description,
                      icon: weatherPreview.icon
                    }}
                    size={32}
                  />
                  <View style={styles.temperatureContainer}>
                    <Text variant="headlineSmall" style={themeStyles.temperature}>
                      {formatTemperature(weatherPreview.temperature, units.temperature)}
                    </Text>
                    <Text variant="bodySmall" style={themeStyles.condition} numberOfLines={1}>
                      {weatherPreview.description}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.weatherDetails}>
                  <Chip 
                    mode="outlined" 
                    compact 
                    style={[styles.conditionChip, themeStyles.chip]}
                    textStyle={styles.chipText}
                  >
                    {weatherPreview.condition}
                  </Chip>
                </View>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    marginHorizontal: 16,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationInfo: {
    flex: 1,
    marginRight: 8,
  },
  locationName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  locationDetails: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherPreview: {
    minHeight: 60,
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginLeft: 8,
  },
  weatherInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  temperatureContainer: {
    marginLeft: 12,
    flex: 1,
  },
  temperature: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  condition: {
    fontSize: 12,
  },
  weatherDetails: {
    alignItems: 'flex-end',
  },
  conditionChip: {
    height: 24,
  },
  chipText: {
    fontSize: 10,
  },
});

FavoriteLocationCard.displayName = 'FavoriteLocationCard';
