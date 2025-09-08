import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LocationPermission } from '../src/components';
import { useLocation } from '../src/hooks';
import { router } from 'expo-router';

export default function PermissionScreen() {
  const { permissionStatus, requestPermission } = useLocation();

  const handleRequestPermission = async () => {
    try {
      const status = await requestPermission();
      if (status.granted) {
        router.back();
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const handleSkip = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <LocationPermission
        permissionStatus={permissionStatus}
        onRequestPermission={handleRequestPermission}
        onSkip={handleSkip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
