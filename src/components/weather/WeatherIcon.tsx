import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { useThemeContext } from '../../contexts/ThemeContext';
import { WeatherCondition } from '../../types';
import { getWeatherIconPath } from '../../utils/weatherIcons';

interface WeatherIconProps {
  condition: WeatherCondition;
  size?: number;
  color?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  condition,
  size = 64,
  color,
}) => {
  const { effectiveTheme, theme } = useThemeContext();
  // Get the custom weather icon image
  const getWeatherIconImage = (iconCode: string) => {
    return getWeatherIconPath(iconCode);
  };

  const weatherIconImage = getWeatherIconImage(condition.icon);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={weatherIconImage}
        style={[
          styles.weatherIcon,
          {
            width: size,
            height: size,
            tintColor: color, // Optional: apply color tint if needed
          }
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherIcon: {
    // Image styles are handled inline for dynamic sizing
  },
});
