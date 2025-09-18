import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { FAB } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FloatingFABProps = {
  icon: string;
  label?: string;
  color?: string;
  backgroundColor?: string;
  onPress: () => void;
  testID?: string;
};

export const FloatingFAB: React.FC<FloatingFABProps> = ({
  icon,
  label,
  color,
  backgroundColor,
  onPress,
  testID,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={StyleSheet.flatten([
      styles.overlay,
      {
        paddingRight: Math.max(insets.right, 16),
        paddingBottom: Math.max(insets.bottom, 16),
      },
    ])}>
      <FAB
        testID={testID}
        icon={icon}
        label={label}
        onPress={onPress}
        style={[styles.fab, backgroundColor ? { backgroundColor } : null]}
        color={color}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  fab: {
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});

export default FloatingFAB;


