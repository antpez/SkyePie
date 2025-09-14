import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useThemeContext } from '../../contexts/ThemeContext';
import { formatTemperature, getThemeAwareTemperatureColor } from '../../utils/formatters';
import { TemperatureUnit } from '../../types';

interface TemperatureDisplayProps {
  temperature: number;
  unit?: TemperatureUnit;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showUnit?: boolean;
  color?: string;
  sunrise?: number; // Unix timestamp for sunrise
  sunset?: number; // Unix timestamp for sunset
  timezone?: number; // Timezone offset in seconds
}

export const TemperatureDisplay: React.FC<TemperatureDisplayProps> = memo(({
  temperature,
  unit = 'celsius',
  size = 'large',
  showUnit = true,
  color,
  sunrise,
  sunset,
  timezone = 0,
}) => {
  const { effectiveTheme } = useThemeContext();

  // Memoize time-of-day based color calculation
  const temperatureColor = useMemo(() => {
    if (color) return color; // Use custom color if provided
    
    if (!sunrise || !sunset) {
      // Fallback to theme-aware temperature color if no time data
      return getThemeAwareTemperatureColor(temperature, unit, effectiveTheme === 'dark');
    }

    // Get current time in the location's timezone
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000); // Convert to UTC
    const locationTime = new Date(utcTime + (timezone * 1000)); // Add timezone offset
    
    // Get sunrise and sunset times in the location's timezone
    const sunriseTime = new Date(sunrise * 1000);
    const sunsetTime = new Date(sunset * 1000);
    
    // Get hours for comparison
    const currentHour = locationTime.getHours();
    const sunriseHour = sunriseTime.getHours();
    const sunsetHour = sunsetTime.getHours();
    
    // Define time ranges
    const sunriseStart = sunriseHour - 1; // 1 hour before sunrise
    const sunriseEnd = sunriseHour + 0.5; // 30 minutes after sunrise
    const sunsetStart = sunsetHour - 1;   // 1 hour before sunset
    const sunsetEnd = sunsetHour + 0.5;   // 30 minutes after sunset
    
    // Determine time of day
    if (currentHour >= sunriseStart && currentHour <= sunriseEnd) {
      return '#FFD700'; // Yellow for sunrise
    } else if (currentHour >= sunsetStart && currentHour <= sunsetEnd) {
      return '#FF8C00'; // Orange for sunset
    } else if (currentHour >= sunriseEnd && currentHour < sunsetStart) {
      return '#1E90FF'; // Blue for day
    } else {
      // Night time - use black for light mode, white for dark mode
      return effectiveTheme === 'dark' ? '#FFFFFF' : '#000000';
    }
  }, [color, sunrise, sunset, timezone, temperature, unit, effectiveTheme]);

  // Memoize size styles
  const sizeStyles = useMemo(() => {
    switch (size) {
      case 'small':
        return { fontSize: 24, lineHeight: 28 };
      case 'medium':
        return { fontSize: 32, lineHeight: 36 };
      case 'large':
        return { fontSize: 48, lineHeight: 52 };
      case 'xlarge':
        return { fontSize: 64, lineHeight: 68 };
      default:
        return { fontSize: 48, lineHeight: 52 };
    }
  }, [size]);

  // Memoize formatted text
  const displayText = useMemo(() => {
    const temperatureText = formatTemperature(temperature, unit);
    return showUnit ? temperatureText : temperatureText.replace(/[°CF]/, '');
  }, [temperature, unit, showUnit]);

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.temperature,
          sizeStyles,
          { color: temperatureColor },
        ]}
      >
        {displayText}
      </Text>
    </View>
  );
});

TemperatureDisplay.displayName = 'TemperatureDisplay';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  temperature: {
    fontWeight: '300',
    textAlign: 'center',
  },
});
