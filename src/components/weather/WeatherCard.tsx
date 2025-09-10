import React, { useMemo, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useThemeContext } from '../../contexts/ThemeContext';
import { useUnits } from '../../contexts/UnitsContext';
import { useAccessibilityContext } from '../../contexts/AccessibilityContext';
import { CurrentWeather } from '../../types';
import { WeatherIcon } from './WeatherIcon';
import { TemperatureDisplay } from './TemperatureDisplay';
import { formatTemperature, formatWindSpeed, formatHumidity, formatPressure, formatVisibility, formatTime } from '../../utils/formatters';

interface WeatherCardProps {
  weather: CurrentWeather;
  showDetails?: boolean;
}

export const WeatherCard: React.FC<WeatherCardProps> = memo(({
  weather,
  showDetails = true,
}) => {
  const { effectiveTheme, theme } = useThemeContext();
  const { units } = useUnits();
  const { 
    generateWeatherAccessibilityLabel, 
    getFontSize, 
    shouldUseBoldText,
    shouldUseHighContrast 
  } = useAccessibilityContext();

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


  // Generate accessibility label
  const accessibilityLabel = useMemo(() => {
    return generateWeatherAccessibilityLabel(weather);
  }, [weather, generateWeatherAccessibilityLabel]);

  // Dynamic font sizes based on accessibility settings
  const titleFontSize = useMemo(() => getFontSize(18), [getFontSize]);
  const bodyFontSize = useMemo(() => getFontSize(14), [getFontSize]);
  const smallFontSize = useMemo(() => getFontSize(12), [getFontSize]);

  // Dynamic font weights
  const titleFontWeight = useMemo(() => shouldUseBoldText() ? 'bold' : 'normal', [shouldUseBoldText]);
  const bodyFontWeight = useMemo(() => shouldUseBoldText() ? '600' : 'normal', [shouldUseBoldText]);

  return (
    <Card 
      style={[
        styles.card, 
        { backgroundColor: theme.colors.surface },
        shouldUseHighContrast() && { borderWidth: 2, borderColor: theme.colors.primary }
      ]}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={accessibilityLabel}
    >
      <Card.Content style={styles.content}>
        {/* Location and condition */}
        <View style={styles.header}>
          <View style={styles.locationInfo}>
            <Text 
              variant="headlineSmall" 
              style={[
                locationNameStyle,
                { fontSize: titleFontSize, fontWeight: titleFontWeight }
              ]}
            >
              {weather.name}
            </Text>
            <Text 
              variant="bodyMedium" 
              style={[
                conditionStyle,
                { fontSize: bodyFontSize, fontWeight: bodyFontWeight }
              ]}
            >
              {mainCondition.description}
            </Text>
          </View>
          <WeatherIcon condition={mainCondition} size={64} />
        </View>

        {/* Temperature */}
        <View style={styles.temperatureSection}>
          <TemperatureDisplay
            temperature={main.temp}
            unit={units.temperature}
            size="xlarge"
          />
          <Text 
            variant="bodyMedium" 
            style={[
              feelsLikeStyle,
              { fontSize: bodyFontSize, fontWeight: bodyFontWeight }
            ]}
          >
            Feels like {formatTemperature(main.feels_like, units.temperature)}
          </Text>
        </View>

        {/* Weather details */}
        {showDetails && (
          <View 
            style={styles.detailsSection}
            accessible={true}
            accessibilityRole="summary"
            accessibilityLabel="Weather details"
          >
            <View style={styles.detailsRow}>
              <View 
                style={styles.detailItem}
                accessible={true}
                accessibilityLabel={`Humidity ${formatHumidity(main.humidity)}`}
              >
                <Text 
                  variant="bodySmall" 
                  style={[
                    detailLabelStyle,
                    { fontSize: smallFontSize, fontWeight: bodyFontWeight }
                  ]}
                >
                  Humidity
                </Text>
                <Text 
                  variant="bodyMedium" 
                  style={[
                    detailValueStyle,
                    { fontSize: bodyFontSize, fontWeight: bodyFontWeight }
                  ]}
                >
                  {formatHumidity(main.humidity)}
                </Text>
              </View>
              <View 
                style={styles.detailItem}
                accessible={true}
                accessibilityLabel={`Wind ${formatWindSpeed(wind.speed, units.windSpeed)}`}
              >
                <Text 
                  variant="bodySmall" 
                  style={[
                    detailLabelStyle,
                    { fontSize: smallFontSize, fontWeight: bodyFontWeight }
                  ]}
                >
                  Wind
                </Text>
                <Text 
                  variant="bodyMedium" 
                  style={[
                    detailValueStyle,
                    { fontSize: bodyFontSize, fontWeight: bodyFontWeight }
                  ]}
                >
                  {formatWindSpeed(wind.speed, units.windSpeed)}
                </Text>
              </View>
            </View>
            <View style={styles.detailsRow}>
              <View 
                style={styles.detailItem}
                accessible={true}
                accessibilityLabel={`Pressure ${formatPressure(main.pressure, units.pressure)}`}
              >
                <Text 
                  variant="bodySmall" 
                  style={[
                    detailLabelStyle,
                    { fontSize: smallFontSize, fontWeight: bodyFontWeight }
                  ]}
                >
                  Pressure
                </Text>
                <Text 
                  variant="bodyMedium" 
                  style={[
                    detailValueStyle,
                    { fontSize: bodyFontSize, fontWeight: bodyFontWeight }
                  ]}
                >
                  {formatPressure(main.pressure, units.pressure)}
                </Text>
              </View>
              <View 
                style={styles.detailItem}
                accessible={true}
                accessibilityLabel={`Visibility ${formatVisibility(weather.visibility, units.distance)}`}
              >
                <Text 
                  variant="bodySmall" 
                  style={[
                    detailLabelStyle,
                    { fontSize: smallFontSize, fontWeight: bodyFontWeight }
                  ]}
                >
                  Visibility
                </Text>
                <Text 
                  variant="bodyMedium" 
                  style={[
                    detailValueStyle,
                    { fontSize: bodyFontSize, fontWeight: bodyFontWeight }
                  ]}
                >
                  {formatVisibility(weather.visibility, units.distance)}
                </Text>
              </View>
            </View>
            <View style={styles.detailsRow}>
              <View 
                style={styles.detailItem}
                accessible={true}
                accessibilityLabel={`Sunrise ${weather.sys.sunrise ? formatTime(weather.sys.sunrise, weather.timezone) : 'Not available'}`}
              >
                <Text 
                  variant="bodySmall" 
                  style={[
                    detailLabelStyle,
                    { fontSize: smallFontSize, fontWeight: bodyFontWeight }
                  ]}
                >
                  Sunrise
                </Text>
                <Text 
                  variant="bodyMedium" 
                  style={[
                    detailValueStyle,
                    { fontSize: bodyFontSize, fontWeight: bodyFontWeight }
                  ]}
                >
                  {weather.sys.sunrise ? formatTime(weather.sys.sunrise, weather.timezone) : 'N/A'}
                </Text>
              </View>
              <View 
                style={styles.detailItem}
                accessible={true}
                accessibilityLabel={`Sunset ${weather.sys.sunset ? formatTime(weather.sys.sunset, weather.timezone) : 'Not available'}`}
              >
                <Text 
                  variant="bodySmall" 
                  style={[
                    detailLabelStyle,
                    { fontSize: smallFontSize, fontWeight: bodyFontWeight }
                  ]}
                >
                  Sunset
                </Text>
                <Text 
                  variant="bodyMedium" 
                  style={[
                    detailValueStyle,
                    { fontSize: bodyFontSize, fontWeight: bodyFontWeight }
                  ]}
                >
                  {weather.sys.sunset ? formatTime(weather.sys.sunset, weather.timezone) : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );
});

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

WeatherCard.displayName = 'WeatherCard';
