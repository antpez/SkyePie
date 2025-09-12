import React, { useMemo, memo, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useThemeContext } from '../../contexts/ThemeContext';
import { useUnits } from '../../contexts/UnitsContext';
import { useAccessibilityContext } from '../../contexts/AccessibilityContext';
import { CurrentWeather } from '../../types';
import { WeatherIcon } from './WeatherIcon';
import { TemperatureDisplay } from './TemperatureDisplay';
import { formatTemperature, formatWindSpeed, formatHumidity, formatPressure, formatVisibility, formatTime } from '../../utils/formatters';
import { performanceMonitor } from '../../utils/performanceMonitor';

interface WeatherCardProps {
  weather: CurrentWeather;
  showDetails?: boolean;
}

export const WeatherCard: React.FC<WeatherCardProps> = memo(({
  weather,
  showDetails = true,
}) => {
  // Performance monitoring
  React.useEffect(() => {
    performanceMonitor.startTiming('WeatherCard_render');
    return () => {
      performanceMonitor.endTiming('WeatherCard_render');
    };
  });

  const { effectiveTheme, theme } = useThemeContext();
  const { units } = useUnits();
  const { 
    generateWeatherAccessibilityLabel, 
    getFontSize, 
    shouldUseBoldText,
    shouldUseHighContrast 
  } = useAccessibilityContext();

  // Get screen dimensions for responsive design - memoized
  const screenDimensions = useMemo(() => Dimensions.get('window'), []);
  const { width } = screenDimensions;
  
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
    detailValue: [styles.detailValue, { color: theme.colors.onSurface }]
  }), [theme.colors]);

  return (
    <View style={styles.container}>
      {/* Main weather display - no gradient background */}
      <View style={styles.weatherDisplay}>
        <View style={styles.content}>
          {/* Location and condition header */}
          <View style={styles.header}>
            <View style={styles.locationInfo}>
              <Text 
                variant="headlineMedium" 
                style={[
                  styles.locationName,
                  { fontSize: accessibilitySettings.titleFontSize, fontWeight: accessibilitySettings.titleFontWeight as any }
                ]}
              >
                {weather.name}
              </Text>
              <Text 
                variant="titleMedium" 
                style={[
                  styles.condition,
                  { fontSize: accessibilitySettings.bodyFontSize, fontWeight: accessibilitySettings.bodyFontWeight as any }
                ]}
              >
                {weatherData.mainCondition.description}
              </Text>
            </View>
            <WeatherIcon 
              condition={weatherData.mainCondition} 
              size={80} 
              accessibilityLabel={`${weatherData.mainCondition.description} weather icon`}
            />
          </View>

          {/* Temperature section */}
          <View style={styles.temperatureSection}>
            <TemperatureDisplay
              temperature={weatherData.main.temp}
              unit={units.temperature}
              size="xlarge"
            />
            <Text 
              variant="titleMedium" 
              style={[
                styles.feelsLike,
                { fontSize: accessibilitySettings.bodyFontSize, fontWeight: accessibilitySettings.bodyFontWeight as any }
              ]}
            >
              Feels like {formattedValues.feelsLike}
            </Text>
          </View>
        </View>
      </View>

      {/* Weather details - no card wrapper */}
      {showDetails && (
        <View 
          style={styles.detailsContainer}
          accessible={true}
          accessibilityRole="summary"
          accessibilityLabel="Weather details"
        >
          <View style={styles.detailsGrid}>
              <View 
                style={styles.detailItem}
                accessible={true}
                accessibilityLabel={`Humidity ${formattedValues.humidity}`}
              >
                <Text 
                  variant="labelMedium" 
                  style={[
                    styles.detailLabel,
                    { fontSize: accessibilitySettings.smallFontSize, fontWeight: accessibilitySettings.bodyFontWeight as any }
                  ]}
                >
                  Humidity
                </Text>
                <Text 
                  variant="titleMedium" 
                  style={[
                    styles.detailValue,
                    { fontSize: accessibilitySettings.bodyFontSize, fontWeight: accessibilitySettings.bodyFontWeight as any }
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
                  variant="labelMedium" 
                  style={[
                    styles.detailLabel,
                    { fontSize: accessibilitySettings.smallFontSize, fontWeight: accessibilitySettings.bodyFontWeight as any }
                  ]}
                >
                  Wind
                </Text>
                <Text 
                  variant="titleMedium" 
                  style={[
                    styles.detailValue,
                    { fontSize: accessibilitySettings.bodyFontSize, fontWeight: accessibilitySettings.bodyFontWeight as any }
                  ]}
                >
                  {formattedValues.windSpeed}
                </Text>
              </View>
              
              <View 
                style={styles.detailItem}
                accessible={true}
                accessibilityLabel={`Pressure ${formattedValues.pressure}`}
              >
                <Text 
                  variant="labelMedium" 
                  style={[
                    styles.detailLabel,
                    { fontSize: accessibilitySettings.smallFontSize, fontWeight: accessibilitySettings.bodyFontWeight as any }
                  ]}
                >
                  Pressure
                </Text>
                <Text 
                  variant="titleMedium" 
                  style={[
                    styles.detailValue,
                    { fontSize: accessibilitySettings.bodyFontSize, fontWeight: accessibilitySettings.bodyFontWeight as any }
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
                  variant="labelMedium" 
                  style={[
                    styles.detailLabel,
                    { fontSize: accessibilitySettings.smallFontSize, fontWeight: accessibilitySettings.bodyFontWeight as any }
                  ]}
                >
                  Visibility
                </Text>
                <Text 
                  variant="titleMedium" 
                  style={[
                    styles.detailValue,
                    { fontSize: accessibilitySettings.bodyFontSize, fontWeight: accessibilitySettings.bodyFontWeight as any }
                  ]}
                >
                  {formattedValues.visibility}
                </Text>
              </View>
              
              <View 
                style={styles.detailItem}
                accessible={true}
                accessibilityLabel={`Sunrise ${formattedValues.sunrise}`}
              >
                <Text 
                  variant="labelMedium" 
                  style={[
                    styles.detailLabel,
                    { fontSize: accessibilitySettings.smallFontSize, fontWeight: accessibilitySettings.bodyFontWeight as any }
                  ]}
                >
                  Sunrise
                </Text>
                <Text 
                  variant="titleMedium" 
                  style={[
                    styles.detailValue,
                    { fontSize: accessibilitySettings.bodyFontSize, fontWeight: accessibilitySettings.bodyFontWeight as any }
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
                  variant="labelMedium" 
                  style={[
                    styles.detailLabel,
                    { fontSize: accessibilitySettings.smallFontSize, fontWeight: accessibilitySettings.bodyFontWeight as any }
                  ]}
                >
                  Sunset
                </Text>
                <Text 
                  variant="titleMedium" 
                  style={[
                    styles.detailValue,
                    { fontSize: accessibilitySettings.bodyFontSize, fontWeight: accessibilitySettings.bodyFontWeight as any }
                  ]}
                >
                  {formattedValues.sunset}
                </Text>
              </View>
            </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  weatherDisplay: {
    marginBottom: 16,
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  locationInfo: {
    flex: 1,
    marginRight: 16,
  },
  locationName: {
    fontWeight: '700',
    marginBottom: 8,
  },
  condition: {
    textTransform: 'capitalize',
    opacity: 0.9,
  },
  temperatureSection: {
    alignItems: 'center',
  },
  feelsLike: {
    marginTop: 12,
    opacity: 0.9,
  },
  detailsContainer: {
    // No background styling - transparent
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  detailLabel: {
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  detailValue: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

WeatherCard.displayName = 'WeatherCard';
