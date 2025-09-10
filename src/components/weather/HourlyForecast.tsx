import React, { useMemo, memo } from 'react';
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

  // Theme-aware text styles
  const timeStyle = useMemo(() => [
    styles.time,
    { color: theme.colors.onSurface }
  ], [theme.colors.onSurface, effectiveTheme]);

  const tempStyle = useMemo(() => [
    styles.temperature,
    { color: theme.colors.onSurface }
  ], [theme.colors.onSurface, effectiveTheme]);

  const descriptionStyle = useMemo(() => [
    styles.description,
    { color: theme.colors.onSurfaceVariant }
  ], [theme.colors.onSurfaceVariant, effectiveTheme]);

  const renderHourlyItem = (item: ForecastItem, index: number) => {
    const time = formatTime(item.dt);
    const temperature = formatTemperature(item.main.temp, units.temperature);
    const description = item.weather[0]?.description || '';

    return (
      <View key={`${item.dt}-${index}`} style={styles.hourlyItem}>
        <Text style={timeStyle}>{time}</Text>
        <WeatherIcon
          condition={item.weather[0]}
          size={32}
        />
        <Text style={tempStyle}>{temperature}</Text>
        <Text style={descriptionStyle} numberOfLines={1}>
          {description}
        </Text>
      </View>
    );
  };

  if (!next12Hours || next12Hours.length === 0) {
    return null;
  }

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.content}>
        <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          12-Hour Forecast
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {next12Hours.map((item, index) => renderHourlyItem(item, index))}
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
