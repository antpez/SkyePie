import React, { useMemo, memo, useCallback } from 'react';
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

  // Memoize weather data extraction to prevent recalculation
  const weatherData = useMemo(() => ({
    mainCondition: weather.weather?.[0] || { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' },
    main: weather.main,
    wind: weather.wind,
    sys: weather.sys,
    visibility: weather.visibility,
    timezone: weather.timezone
  }), [weather]);

  // Memoize formatted values to prevent recalculation on every render
  const formattedValues = useMemo(() => ({
    humidity: formatHumidity(weatherData.main.humidity),
    windSpeed: formatWindSpeed(weatherData.wind.speed, units.windSpeed),
    pressure: formatPressure(weatherData.main.pressure, units.pressure),
    visibility: formatVisibility(weatherData.visibility, units.distance),
    sunrise: weatherData.sys.sunrise ? formatTime(weatherData.sys.sunrise, weatherData.timezone) : 'N/A',
    sunset: weatherData.sys.sunset ? formatTime(weatherData.sys.sunset, weatherData.timezone) : 'N/A',
    feelsLike: formatTemperature(weatherData.main.feels_like, units.temperature)
  }), [weatherData, units]);

  // Memoize accessibility settings to prevent recalculation
  const accessibilitySettings = useMemo(() => ({
    titleFontSize: getFontSize(18),
    bodyFontSize: getFontSize(14),
    smallFontSize: getFontSize(12),
    titleFontWeight: shouldUseBoldText() ? 'bold' : 'normal',
    bodyFontWeight: shouldUseBoldText() ? '600' : 'normal',
    useHighContrast: shouldUseHighContrast()
  }), [getFontSize, shouldUseBoldText, shouldUseHighContrast]);

  // Memoize accessibility label
  const accessibilityLabel = useMemo(() => {
    return generateWeatherAccessibilityLabel(weather);
  }, [weather, generateWeatherAccessibilityLabel]);

  // Memoize theme-aware styles
  const themeStyles = useMemo(() => ({
    locationName: [styles.locationName, { color: theme.colors.onSurface }],
    condition: [styles.condition, { color: theme.colors.onSurfaceVariant }],
    feelsLike: [styles.feelsLike, { color: theme.colors.onSurfaceVariant }],
    detailLabel: [styles.detailLabel, { color: theme.colors.onSurfaceVariant }],
    detailValue: [styles.detailValue, { color: theme.colors.onSurface }],
    card: [styles.card, { backgroundColor: theme.colors.surface }]
  }), [theme.colors]);

  // Memoize card style with high contrast
  const cardStyle = useMemo(() => [
    themeStyles.card,
    accessibilitySettings.useHighContrast && { borderWidth: 2, borderColor: theme.colors.primary }
  ], [themeStyles.card, accessibilitySettings.useHighContrast, theme.colors.primary]);

  return (
    <Card 
      style={cardStyle}
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
                themeStyles.locationName,
                { fontSize: accessibilitySettings.titleFontSize, fontWeight: accessibilitySettings.titleFontWeight }
              ]}
            >
              {weather.name}
            </Text>
            <Text 
              variant="bodyMedium" 
              style={[
                themeStyles.condition,
                { fontSize: accessibilitySettings.bodyFontSize, fontWeight: accessibilitySettings.bodyFontWeight }
              ]}
            >
              {weatherData.mainCondition.description}
            </Text>
          </View>
          <WeatherIcon 
            condition={weatherData.mainCondition} 
            size={64} 
            accessibilityLabel={`${weatherData.mainCondition.description} weather icon`}
          />
        </View>

        {/* Temperature */}
        <View style={styles.temperatureSection}>
          <TemperatureDisplay
            temperature={weatherData.main.temp}
            unit={units.temperature}
            size="xlarge"
          />
          <Text 
            variant="bodyMedium" 
            style={[
              themeStyles.feelsLike,
              { fontSize: accessibilitySettings.bodyFontSize, fontWeight: accessibilitySettings.bodyFontWeight }
            ]}
          >
            Feels like {formattedValues.feelsLike}
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
                accessibilityLabel={`Humidity ${formattedValues.humidity}`}
              >
                <Text 
                  variant="bodySmall" 
                  style={[
                    themeStyles.detailLabel,
                    { fontSize: accessibilitySettings.smallFontSize, fontWeight: accessibilitySettings.bodyFontWeight }
                  ]}
                >
                  Humidity
                </Text>
                <Text 
                  variant="bodyMedium" 
                  style={[
                    themeStyles.detailValue,
                    { fontSize: accessibilitySettings.bodyFontSize, fontWeight: accessibilitySettings.bodyFontWeight }
                  ]}
                >
                  {formattedValues.humidity}
                </Text>
              </View>
              <View 
                style={styles.detailItem}
                accessible={true}
                accessibilityLabel={`Wind ${formattedValues.windSpeed}`}
              >
                <Text 
                  variant="bodySmall" 
                  style={[
                    themeStyles.detailLabel,
                    { fontSize: accessibilitySettings.smallFontSize, fontWeight: accessibilitySettings.bodyFontWeight }
                  ]}
                >
                  Wind
                </Text>
                <Text 
                  variant="bodyMedium" 
                  style={[
                    themeStyles.detailValue,
                    { fontSize: accessibilitySettings.bodyFontSize, fontWeight: accessibilitySettings.bodyFontWeight }
                  ]}
                >
                  {formattedValues.windSpeed}
                </Text>
              </View>
            </View>
            <View style={styles.detailsRow}>
              <View 
                style={styles.detailItem}
                accessible={true}
                accessibilityLabel={`Pressure ${formattedValues.pressure}`}
              >
                <Text 
                  variant="bodySmall" 
                  style={[
                    themeStyles.detailLabel,
                    { fontSize: accessibilitySettings.smallFontSize, fontWeight: accessibilitySettings.bodyFontWeight }
                  ]}
                >
                  Pressure
                </Text>
                <Text 
                  variant="bodyMedium" 
                  style={[
                    themeStyles.detailValue,
                    { fontSize: accessibilitySettings.bodyFontSize, fontWeight: accessibilitySettings.bodyFontWeight }
                  ]}
                >
                  {formattedValues.pressure}
                </Text>
              </View>
              <View 
                style={styles.detailItem}
                accessible={true}
                accessibilityLabel={`Visibility ${formattedValues.visibility}`}
              >
                <Text 
                  variant="bodySmall" 
                  style={[
                    themeStyles.detailLabel,
                    { fontSize: accessibilitySettings.smallFontSize, fontWeight: accessibilitySettings.bodyFontWeight }
                  ]}
                >
                  Visibility
                </Text>
                <Text 
                  variant="bodyMedium" 
                  style={[
                    themeStyles.detailValue,
                    { fontSize: accessibilitySettings.bodyFontSize, fontWeight: accessibilitySettings.bodyFontWeight }
                  ]}
                >
                  {formattedValues.visibility}
                </Text>
              </View>
            </View>
            <View style={styles.detailsRow}>
              <View 
                style={styles.detailItem}
                accessible={true}
                accessibilityLabel={`Sunrise ${formattedValues.sunrise}`}
              >
                <Text 
                  variant="bodySmall" 
                  style={[
                    themeStyles.detailLabel,
                    { fontSize: accessibilitySettings.smallFontSize, fontWeight: accessibilitySettings.bodyFontWeight }
                  ]}
                >
                  Sunrise
                </Text>
                <Text 
                  variant="bodyMedium" 
                  style={[
                    themeStyles.detailValue,
                    { fontSize: accessibilitySettings.bodyFontSize, fontWeight: accessibilitySettings.bodyFontWeight }
                  ]}
                >
                  {formattedValues.sunrise}
                </Text>
              </View>
              <View 
                style={styles.detailItem}
                accessible={true}
                accessibilityLabel={`Sunset ${formattedValues.sunset}`}
              >
                <Text 
                  variant="bodySmall" 
                  style={[
                    themeStyles.detailLabel,
                    { fontSize: accessibilitySettings.smallFontSize, fontWeight: accessibilitySettings.bodyFontWeight }
                  ]}
                >
                  Sunset
                </Text>
                <Text 
                  variant="bodyMedium" 
                  style={[
                    themeStyles.detailValue,
                    { fontSize: accessibilitySettings.bodyFontSize, fontWeight: accessibilitySettings.bodyFontWeight }
                  ]}
                >
                  {formattedValues.sunset}
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
