import React, { useMemo, useCallback, useEffect } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { useThemeContext } from '../../contexts/ThemeContext';
import { WeatherCondition } from '../../types';
import { performanceMonitor } from '../../utils/performanceMonitor';
import { imageLoader } from '../../utils/imageLoader';

// Direct image imports for weather icons
const weatherIcons = {
  '01d': require('../../assets/images/weather-icons/sunny.png'),
  '01n': require('../../assets/images/weather-icons/clear_night.png'),
  '02d': require('../../assets/images/weather-icons/partly_cloudy.png'),
  '02n': require('../../assets/images/weather-icons/cloudy_night_half.png'),
  '03d': require('../../assets/images/weather-icons/light_cloudy.png'),
  '03n': require('../../assets/images/weather-icons/cloudy_night_half.png'),
  '04d': require('../../assets/images/weather-icons/cloudy.png'),
  '04n': require('../../assets/images/weather-icons/cloudy_night_full.png'),
  '09d': require('../../assets/images/weather-icons/light_rain.png'),
  '09n': require('../../assets/images/weather-icons/light_rain.png'),
  '10d': require('../../assets/images/weather-icons/rain.png'),
  '10n': require('../../assets/images/weather-icons/rain.png'),
  '11d': require('../../assets/images/weather-icons/heavy_storm.png'),
  '11n': require('../../assets/images/weather-icons/heavy_storm.png'),
  '13d': require('../../assets/images/weather-icons/storm1.png'),
  '13n': require('../../assets/images/weather-icons/storm1.png'),
  '50d': require('../../assets/images/weather-icons/windy.png'),
  '50n': require('../../assets/images/weather-icons/windy.png'),
};

// Fallback emoji icons for weather conditions (only as last resort)
const getWeatherEmoji = (iconCode: string): string => {
  const emojiMap: { [key: string]: string } = {
    '01d': '☀️', // clear sky day
    '01n': '🌙', // clear sky night
    '02d': '⛅', // few clouds day
    '02n': '☁️', // few clouds night
    '03d': '☁️', // scattered clouds day
    '03n': '☁️', // scattered clouds night
    '04d': '☁️', // broken clouds day
    '04n': '☁️', // broken clouds night
    '09d': '🌦️', // shower rain day
    '09n': '🌦️', // shower rain night
    '10d': '🌧️', // rain day
    '10n': '🌧️', // rain night
    '11d': '⛈️', // thunderstorm day
    '11n': '⛈️', // thunderstorm night
    '13d': '❄️', // snow day
    '13n': '❄️', // snow night
    '50d': '🌫️', // mist day
    '50n': '🌫️', // mist night
  };
  return emojiMap[iconCode] || '☀️';
};

interface WeatherIconProps {
  condition: WeatherCondition;
  size?: number;
  color?: string;
  accessibilityLabel?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = React.memo(({
  condition,
  size = 64,
  color,
  accessibilityLabel,
}) => {
  // Simple performance monitoring for slow renders only
  const renderStartTime = React.useRef<number | null>(null);
  
  React.useEffect(() => {
    if (__DEV__) {
      renderStartTime.current = performance.now();
      return () => {
        if (renderStartTime.current) {
          const renderTime = performance.now() - renderStartTime.current;
          if (renderTime > 50) { // Only log slow icon renders
            performanceMonitor.startTiming('WeatherIcon_render');
            performanceMonitor.endTiming('WeatherIcon_render');
          }
        }
      };
    }
  });

  const { effectiveTheme, theme } = useThemeContext();
  
  // Memoize weather icon image selection
  const weatherIconImage = useMemo(() => {
    if (!condition?.icon) {
      return weatherIcons['01d']; // Default to clear sky day
    }
    return weatherIcons[condition.icon as keyof typeof weatherIcons] || weatherIcons['01d'];
  }, [condition?.icon]);

  // Check if we have a valid image source (require() should return a number for local images)
  const hasValidImage = useMemo(() => {
    return weatherIconImage && (typeof weatherIconImage === 'number' || (typeof weatherIconImage === 'object' && weatherIconImage.uri));
  }, [weatherIconImage]);

  // Check if image is preloaded for better performance
  const isImagePreloaded = useMemo(() => {
    return imageLoader.isPreloaded(weatherIconImage);
  }, [weatherIconImage]);
  
  // Memoize accessibility label
  const accessibilityLabelText = useMemo(() => {
    if (accessibilityLabel) return accessibilityLabel;
    return `${condition?.description || 'Weather'} icon`;
  }, [accessibilityLabel, condition?.description]);
  
  // Memoize emoji fallback
  const emojiFallback = useMemo(() => {
    const emoji = getWeatherEmoji(condition?.icon || '01d');
    return (
      <View 
        style={[styles.container, { width: size, height: size }]}
        accessible={true}
        accessibilityLabel={accessibilityLabelText}
        accessibilityRole="image"
      >
        <Text style={[styles.emojiIcon, { fontSize: size * 0.8 }]}>
          {emoji}
        </Text>
      </View>
    );
  }, [condition?.icon, size, accessibilityLabelText]);

  // If no valid image, use emoji fallback
  if (!hasValidImage) {
    return emojiFallback;
  }

  return (
    <View 
      style={[styles.container, { width: size, height: size }]}
      accessible={true}
      accessibilityLabel={accessibilityLabelText}
      accessibilityRole="image"
    >
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
        accessibilityIgnoresInvertColors={true}
        onError={(error) => {
          console.warn('WeatherIcon: Failed to load image, using emoji fallback:', error.nativeEvent.error);
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherIcon: {
    // Image styles are handled inline for dynamic sizing
  },
  emojiIcon: {
    textAlign: 'center',
    lineHeight: 1,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  placeholderText: {
    color: '#666',
    fontWeight: 'bold',
  },
});

WeatherIcon.displayName = 'WeatherIcon';
