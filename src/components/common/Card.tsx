import React from 'react';
import { Card as PaperCard, CardProps as PaperCardProps } from 'react-native-paper';
import { StyleSheet, ViewStyle } from 'react-native';

interface CardProps extends Omit<PaperCardProps, 'elevation'> {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation = 2,
  ...props
}) => {
  return (
    <PaperCard 
      style={[styles.card, style]} 
      {...props}
    >
      {children}
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
  },
});
