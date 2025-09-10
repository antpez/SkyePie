import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useAccessibilityContext } from '../../contexts/AccessibilityContext';

interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  minHeight?: number;
  icon?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = memo(({
  title,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  style,
  textStyle,
  minHeight,
  icon,
}) => {
  const { 
    getMinTouchTargetSize, 
    getFontSize, 
    shouldUseBoldText,
    isScreenReaderActive 
  } = useAccessibilityContext();

  const minTouchSize = minHeight || getMinTouchTargetSize();
  const fontSize = getFontSize(16);
  const isBold = shouldUseBoldText();
  const isScreenReader = isScreenReaderActive();

  const buttonStyle: ViewStyle = {
    ...styles.button,
    minHeight: minTouchSize,
    minWidth: minTouchSize,
    ...(disabled && styles.disabled),
    ...style,
  };

  const textStyleCombined: TextStyle = {
    ...styles.text,
    fontSize,
    fontWeight: isBold ? 'bold' : 'normal',
    ...(disabled && styles.disabledText),
    ...textStyle,
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      accessible={true}
    >
      <Text style={textStyleCombined}>
        {icon && `${icon} `}
        {title}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  text: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  disabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  disabledText: {
    color: '#666666',
  },
});

AccessibleButton.displayName = 'AccessibleButton';
