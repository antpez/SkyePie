import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useThemeContext } from '../../contexts/ThemeContext';
import { CurrentWeather, TemperatureUnit } from '../../types';
import { 
  formatWindSpeed, 
  formatHumidity, 
  formatPressure, 
  formatVisibility,
  formatWindDirection 
} from '../../utils/formatters';

interface WeatherDetailsProps {
  weather: CurrentWeather;
  temperatureUnit?: TemperatureUnit;
  windSpeedUnit?: 'kmh' | 'mph' | 'ms';
  pressureUnit?: 'hpa' | 'in' | 'mb';
}

export const WeatherDetails: React.FC<WeatherDetailsProps> = ({
  weather,
  temperatureUnit = 'celsius',
  windSpeedUnit = 'kmh',
  pressureUnit = 'hpa',
}) => {
  const { effectiveTheme, theme } = useThemeContext();

  const main = weather.main;
  const wind = weather.wind;
  const sys = weather.sys;

  const details = [
    {
      label: 'Feels Like',
      value: `${Math.round(main.feels_like)}°${temperatureUnit === 'fahrenheit' ? 'F' : 'C'}`,
      icon: 'thermometer',
    },
    {
      label: 'Humidity',
      value: formatHumidity(main.humidity),
      icon: 'water',
    },
    {
      label: 'Wind Speed',
      value: formatWindSpeed(wind.speed, windSpeedUnit),
      icon: 'weather-windy',
    },
    {
      label: 'Wind Direction',
      value: formatWindDirection(wind.deg),
      icon: 'compass',
    },
    {
      label: 'Pressure',
      value: formatPressure(main.pressure, pressureUnit),
      icon: 'gauge',
    },
    {
      label: 'Visibility',
      value: formatVisibility(weather.visibility),
      icon: 'eye',
    },
    {
      label: 'UV Index',
      value: 'N/A', // This would come from a different API endpoint
      icon: 'weather-sunny',
    },
    {
      label: 'Dew Point',
      value: `${Math.round(main.temp - ((100 - main.humidity) / 5))}°${temperatureUnit === 'fahrenheit' ? 'F' : 'C'}`,
      icon: 'water-percent',
    },
  ];

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Weather Details
        </Text>
        <View style={styles.detailsGrid}>
          {details.map((detail, index) => (
            <View key={index} style={styles.detailItem}>
              <Text variant="bodySmall" style={styles.detailLabel}>
                {detail.label}
              </Text>
              <Text variant="bodyMedium" style={styles.detailValue}>
                {detail.value}
              </Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 2,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
  },
  detailLabel: {
    opacity: 0.7,
    marginBottom: 4,
    textAlign: 'center',
  },
  detailValue: {
    fontWeight: '500',
    textAlign: 'center',
  },
});
