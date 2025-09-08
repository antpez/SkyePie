import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useThemeContext } from '../../contexts/ThemeContext';
import { CurrentWeather, TemperatureUnit } from '../../types';
import { WeatherIcon } from './WeatherIcon';
import { TemperatureDisplay } from './TemperatureDisplay';
import { formatTemperature, formatWindSpeed, formatHumidity, formatPressure } from '../../utils/formatters';

interface WeatherCardProps {
  weather: CurrentWeather;
  temperatureUnit?: TemperatureUnit;
  windSpeedUnit?: 'kmh' | 'mph' | 'ms';
  pressureUnit?: 'hpa' | 'in' | 'mb';
  showDetails?: boolean;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  weather,
  temperatureUnit = 'celsius',
  windSpeedUnit = 'kmh',
  pressureUnit = 'hpa',
  showDetails = true,
}) => {
  const { effectiveTheme, theme } = useThemeContext();

  const mainCondition = weather.weather[0];
  const main = weather.main;
  const wind = weather.wind;

  // Theme-aware text styles
  const locationNameStyle = useMemo(() => [
    styles.locationName,
    { color: theme.colors.onSurface }
  ], [theme.colors.onSurface, effectiveTheme]);

  const conditionStyle = useMemo(() => [
    styles.condition,
    { color: theme.colors.onSurfaceVariant }
  ], [theme.colors.onSurfaceVariant, effectiveTheme]);

  const feelsLikeStyle = useMemo(() => [
    styles.feelsLike,
    { color: theme.colors.onSurfaceVariant }
  ], [theme.colors.onSurfaceVariant, effectiveTheme]);

  const detailLabelStyle = useMemo(() => [
    styles.detailLabel,
    { color: theme.colors.onSurfaceVariant }
  ], [theme.colors.onSurfaceVariant, effectiveTheme]);

  const detailValueStyle = useMemo(() => [
    styles.detailValue,
    { color: theme.colors.onSurface }
  ], [theme.colors.onSurface, effectiveTheme]);


  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.content}>
        {/* Location and condition */}
        <View style={styles.header}>
          <View style={styles.locationInfo}>
            <Text variant="headlineSmall" style={locationNameStyle}>
              {weather.name}
            </Text>
            <Text variant="bodyMedium" style={conditionStyle}>
              {mainCondition.description}
            </Text>
          </View>
          <WeatherIcon condition={mainCondition} size={64} />
        </View>

        {/* Temperature */}
        <View style={styles.temperatureSection}>
          <TemperatureDisplay
            temperature={main.temp}
            unit={temperatureUnit}
            size="xlarge"
          />
          <Text variant="bodyMedium" style={feelsLikeStyle}>
            Feels like {formatTemperature(main.feels_like, temperatureUnit)}
          </Text>
        </View>

        {/* Weather details */}
        {showDetails && (
          <View style={styles.detailsSection}>
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text variant="bodySmall" style={detailLabelStyle}>
                  Humidity
                </Text>
                <Text variant="bodyMedium" style={detailValueStyle}>
                  {formatHumidity(main.humidity)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text variant="bodySmall" style={detailLabelStyle}>
                  Wind
                </Text>
                <Text variant="bodyMedium" style={detailValueStyle}>
                  {formatWindSpeed(wind.speed, windSpeedUnit)}
                </Text>
              </View>
            </View>
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text variant="bodySmall" style={detailLabelStyle}>
                  Pressure
                </Text>
                <Text variant="bodyMedium" style={detailValueStyle}>
                  {formatPressure(main.pressure, pressureUnit)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text variant="bodySmall" style={detailLabelStyle}>
                  Visibility
                </Text>
                <Text variant="bodyMedium" style={detailValueStyle}>
                  {Math.round(weather.visibility / 1000)} km
                </Text>
              </View>
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 4,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  condition: {
    textTransform: 'capitalize',
    opacity: 0.8,
  },
  temperatureSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  feelsLike: {
    marginTop: 8,
    opacity: 0.8,
  },
  detailsSection: {
    marginTop: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  detailValue: {
    fontWeight: '500',
  },
});
