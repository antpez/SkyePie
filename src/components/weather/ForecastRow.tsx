import React, { useMemo, memo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useThemeContext } from '../../contexts/ThemeContext';
import { useUnits } from '../../contexts/UnitsContext';
import { ForecastItem } from '../../types';
import { WeatherIcon } from './WeatherIcon';
import { formatTemperature, formatDayOfWeek } from '../../utils/formatters';

interface ForecastRowProps {
  forecast: ForecastItem[];
}

export const ForecastRow: React.FC<ForecastRowProps> = memo(({
  forecast,
}) => {
  const { effectiveTheme, theme } = useThemeContext();
  const { units } = useUnits();

  // Theme-aware text styles
  const dayNameStyle = useMemo(() => [
    styles.dayName,
    { color: theme.colors.onSurface }
  ], [theme.colors.onSurface, effectiveTheme]);

  const highTempStyle = useMemo(() => [
    styles.highTemp,
    { color: theme.colors.onSurface }
  ], [theme.colors.onSurface, effectiveTheme]);

  const lowTempStyle = useMemo(() => [
    styles.lowTemp,
    { color: theme.colors.onSurfaceVariant }
  ], [theme.colors.onSurfaceVariant, effectiveTheme]);

  // Group forecast by day and calculate daily high/low temperatures
  const dailyForecast = (forecast || []).reduce((acc, item) => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toDateString();
    
    if (!acc[dayKey]) {
      acc[dayKey] = {
        ...item,
        dailyHigh: item.main.temp_max,
        dailyLow: item.main.temp_min,
        weatherIcon: item.weather[0],
        dayName: formatDayOfWeek(item.dt),
        originalDate: date,
        itemCount: 1,
      };
    } else {
      // Update with the actual high and low temperatures for the day
      acc[dayKey].dailyHigh = Math.max(acc[dayKey].dailyHigh, item.main.temp_max);
      acc[dayKey].dailyLow = Math.min(acc[dayKey].dailyLow, item.main.temp_min);
      acc[dayKey].itemCount += 1;
    }
    return acc;
  }, {} as Record<string, any>);

  // Sort by date to ensure proper order
  const forecastItems = Object.values(dailyForecast)
    .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime())
    .slice(0, 7);


  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        7-Day Forecast
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {forecastItems.map((item, index) => {
          return (
            <Card 
              key={`${item.dt}-${index}`} 
              style={[styles.forecastCard, { backgroundColor: theme.colors.surface }]}
            >
              <Card.Content style={styles.forecastContent}>
                <Text variant="bodySmall" style={dayNameStyle}>
                  {item.dayName}
                </Text>
                <WeatherIcon condition={item.weatherIcon} size={32} />
                <View style={styles.temperatureContainer}>
                  <Text variant="bodyMedium" style={highTempStyle}>
                    {formatTemperature(item.dailyHigh, units.temperature).replace(/[°CF]/, '')}
                  </Text>
                  <Text variant="bodySmall" style={lowTempStyle}>
                    {formatTemperature(item.dailyLow, units.temperature).replace(/[°CF]/, '')}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    marginHorizontal: 16,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  forecastCard: {
    marginRight: 12,
    minWidth: 80,
    elevation: 2,
  },
  forecastContent: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  dayName: {
    marginBottom: 8,
    fontWeight: '500',
  },
  temperatureContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  highTemp: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  lowTemp: {
    opacity: 0.6,
    fontSize: 12,
    marginTop: 2,
  },
});

ForecastRow.displayName = 'ForecastRow';
