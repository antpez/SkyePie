import React from 'react';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';
import { StyleSheet, ViewStyle } from 'react-native';

interface ButtonProps extends PaperButtonProps {
  children: React.ReactNode;
  style?: ViewStyle;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  style,
  loading = false,
  disabled,
  ...props
}) => {
  return (
    <PaperButton
      style={[styles.button, style]}
      disabled={disabled || loading}
      loading={loading}
      {...props}
    >
      {children}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 4,
  },
});
