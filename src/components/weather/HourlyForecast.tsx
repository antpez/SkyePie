import React, { useMemo, memo, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeContext } from '../../contexts/ThemeContext';
import { useUnits } from '../../contexts/UnitsContext';
import { ForecastItem } from '../../types';
import { WeatherIcon } from './WeatherIcon';
import { formatTemperature, formatTime, formatWindSpeed, formatHumidity, formatRainfall } from '../../utils/formatters';
import { typography } from '../../styles/typography';

interface HourlyForecastProps {
  forecast: ForecastItem[];
}

export const HourlyForecast: React.FC<HourlyForecastProps> = memo(({
  forecast,
}) => {
  const { effectiveTheme, theme } = useThemeContext();
  const { units } = useUnits();

  // Filter to show next 24 hours (8 items since we get 3-hour intervals)
  const next24Hours = useMemo(() => {
    return forecast.slice(0, 8);
  }, [forecast]);

  // Memoize processed forecast items to prevent recalculation
  const processedForecastItems = useMemo(() => {
    return next24Hours.map((item, index) => ({
      id: `${item.dt}-${index}`,
      time: formatTime(item.dt),
      temperature: formatTemperature(item.main.temp, units.temperature),
      feelsLike: formatTemperature(item.main.feels_like, units.temperature),
      description: item.weather[0]?.description || '',
      condition: item.weather[0],
      humidity: formatHumidity(item.main.humidity),
      windSpeed: formatWindSpeed(item.wind.speed, units.windSpeed),
      windDirection: item.wind.deg,
      precipitation: item.pop ? Math.round(item.pop * 100) : 0,
      rainfall: item.rain?.['1h'] ? formatRainfall(item.rain['1h'], units.rainfall) : '0 mm',
      visibility: item.visibility ? Math.round(item.visibility / 1000) : null
    }));
  }, [next24Hours, units.temperature, units.windSpeed, units.rainfall]);

  // Memoize theme styles
  const themeStyles = useMemo(() => ({
    time: [styles.time, { color: theme.colors.onSurface }],
    temperature: [styles.temperature, { color: theme.colors.onSurface }],
    feelsLike: [styles.feelsLike, { color: theme.colors.onSurfaceVariant }],
    description: [styles.description, { color: theme.colors.onSurfaceVariant }],
    title: [styles.title, { color: theme.colors.onSurface }],
    detailText: [styles.detailText, { color: theme.colors.onSurfaceVariant }],
    chip: { backgroundColor: theme.colors.surfaceVariant }
  }), [theme.colors]);

  // Memoize render function to prevent recreation
  const renderHourlyItem = useCallback((item: typeof processedForecastItems[0]) => {
    return (
      <View key={item.id} style={styles.hourlyItem}>
        <Text style={themeStyles.time}>{item.time}</Text>
        <WeatherIcon
          condition={item.condition}
          size={36}
        />
        <Text style={themeStyles.temperature}>{item.temperature}</Text>
        <Text style={themeStyles.feelsLike}>Feels {item.feelsLike}</Text>
        <Text style={themeStyles.description} numberOfLines={1}>
          {item.description}
        </Text>
        
        {/* Additional details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons 
              name="water" 
              size={12} 
              color={theme.colors.onSurfaceVariant} 
            />
            <Text style={themeStyles.detailText}>{item.humidity}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons 
              name="weather-windy" 
              size={12} 
              color={theme.colors.onSurfaceVariant} 
            />
            <Text style={themeStyles.detailText}>{item.windSpeed}</Text>
          </View>
          
          {item.precipitation > 0 && (
            <Chip 
              mode="outlined" 
              compact 
              style={[styles.precipitationChip, themeStyles.chip]}
              textStyle={styles.chipText}
            >
              {item.precipitation}%
            </Chip>
          )}
        </View>
      </View>
    );
  }, [themeStyles, theme.colors]);

  if (!next24Hours || next24Hours.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={themeStyles.title}>
        24-Hour Forecast
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {processedForecastItems.map(renderHourlyItem)}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 16,
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  hourlyItem: {
    alignItems: 'center',
    minWidth: 100,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  time: {
    ...typography.labelSmall,
    marginBottom: 6,
  },
  temperature: {
    ...typography.titleSmall,
    marginTop: 4,
  },
  feelsLike: {
    ...typography.caption,
    marginTop: 2,
    textAlign: 'center',
  },
  description: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  detailsContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  detailText: {
    ...typography.caption,
    marginLeft: 2,
  },
  precipitationChip: {
    marginTop: 2,
    height: 20,
  },
  chipText: {
    ...typography.caption,
  },
});

HourlyForecast.displayName = 'HourlyForecast';
