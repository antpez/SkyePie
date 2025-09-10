import React, { useMemo, memo, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useThemeContext } from '../../contexts/ThemeContext';
import { useUnits } from '../../contexts/UnitsContext';
import { ForecastItem } from '../../types';
import { WeatherIcon } from './WeatherIcon';
import { formatTemperature, formatTime } from '../../utils/formatters';

interface HourlyForecastProps {
  forecast: ForecastItem[];
}

export const HourlyForecast: React.FC<HourlyForecastProps> = memo(({
  forecast,
}) => {
  const { effectiveTheme, theme } = useThemeContext();
  const { units } = useUnits();

  // Filter to show next 12 hours (4 items since we get 3-hour intervals)
  const next12Hours = useMemo(() => {
    return forecast.slice(0, 4);
  }, [forecast]);

  // Memoize processed forecast items to prevent recalculation
  const processedForecastItems = useMemo(() => {
    return next12Hours.map((item, index) => ({
      id: `${item.dt}-${index}`,
      time: formatTime(item.dt),
      temperature: formatTemperature(item.main.temp, units.temperature),
      description: item.weather[0]?.description || '',
      condition: item.weather[0]
    }));
  }, [next12Hours, units.temperature]);

  // Memoize theme styles
  const themeStyles = useMemo(() => ({
    time: [styles.time, { color: theme.colors.onSurface }],
    temperature: [styles.temperature, { color: theme.colors.onSurface }],
    description: [styles.description, { color: theme.colors.onSurfaceVariant }],
    card: [styles.card, { backgroundColor: theme.colors.surface }],
    title: [styles.title, { color: theme.colors.onSurface }]
  }), [theme.colors]);

  // Memoize render function to prevent recreation
  const renderHourlyItem = useCallback((item: typeof processedForecastItems[0]) => {
    return (
      <View key={item.id} style={styles.hourlyItem}>
        <Text style={themeStyles.time}>{item.time}</Text>
        <WeatherIcon
          condition={item.condition}
          size={32}
        />
        <Text style={themeStyles.temperature}>{item.temperature}</Text>
        <Text style={themeStyles.description} numberOfLines={1}>
          {item.description}
        </Text>
      </View>
    );
  }, [themeStyles]);

  if (!next12Hours || next12Hours.length === 0) {
    return null;
  }

  return (
    <Card style={themeStyles.card}>
      <Card.Content style={styles.content}>
        <Text variant="titleMedium" style={themeStyles.title}>
          12-Hour Forecast
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {processedForecastItems.map(renderHourlyItem)}
        </ScrollView>
      </Card.Content>
    </Card>
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
  title: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hourlyItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 12,
  },
  time: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  temperature: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  description: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
});

HourlyForecast.displayName = 'HourlyForecast';
