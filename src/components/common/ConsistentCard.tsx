import React from 'react';
import { Card, CardProps } from 'react-native-paper';
import { StyleSheet, ViewStyle } from 'react-native';
import { useThemeContext } from '../../contexts/ThemeContext';

interface ConsistentCardProps extends Omit<CardProps, 'elevation'> {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: number;
  margin?: 'none' | 'small' | 'medium' | 'large';
}

export const ConsistentCard: React.FC<ConsistentCardProps> = ({
  children,
  style,
  elevation = 2,
  margin = 'medium',
  ...props
}) => {
  const { theme } = useThemeContext();

  const marginStyle = {
    none: {},
    small: { margin: 8 },
    medium: { margin: 16 },
    large: { margin: 24 },
  }[margin];

  return (
    <Card
      style={[
        styles.card,
        marginStyle,
        { backgroundColor: theme.colors.surface },
        style,
      ]}
      elevation={elevation as any}
      {...props}
    >
      {children}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
  },
});
