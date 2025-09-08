import React from 'react';
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
}

export const TemperatureDisplay: React.FC<TemperatureDisplayProps> = ({
  temperature,
  unit = 'celsius',
  size = 'large',
  showUnit = true,
  color,
}) => {
  const { effectiveTheme, theme } = useThemeContext();

  const getSizeStyles = () => {
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
  };

  const temperatureText = formatTemperature(temperature, unit);
  const displayText = showUnit ? temperatureText : temperatureText.replace(/[°CF]/, '');
  const temperatureColor = color || getThemeAwareTemperatureColor(temperature, unit, effectiveTheme === 'dark');

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.temperature,
          getSizeStyles(),
          { color: temperatureColor },
        ]}
      >
        {displayText}
      </Text>
    </View>
  );
};

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
