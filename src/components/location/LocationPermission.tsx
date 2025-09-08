import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, Icon } from 'react-native-paper';
import { useThemeContext } from '../../contexts/ThemeContext';
import { LocationPermissionStatus } from '../../types';

interface LocationPermissionProps {
  permissionStatus: LocationPermissionStatus;
  onRequestPermission: () => void;
  onSkip: () => void;
}

export const LocationPermission: React.FC<LocationPermissionProps> = ({
  permissionStatus,
  onRequestPermission,
  onSkip,
}) => {
  const { effectiveTheme, theme } = useThemeContext();

  const getStatusIcon = () => {
    switch (permissionStatus.status) {
      case 'granted':
        return 'check-circle';
      case 'denied':
        return 'close-circle';
      default:
        return 'location-off';
    }
  };

  const getStatusColor = () => {
    switch (permissionStatus.status) {
      case 'granted':
        return theme.colors.primary;
      case 'denied':
        return theme.colors.error;
      default:
        return theme.colors.onSurface;
    }
  };

  const getStatusMessage = () => {
    switch (permissionStatus.status) {
      case 'granted':
        return 'Location access granted! We can now show you local weather.';
      case 'denied':
        return 'Location access denied. You can still search for weather by city.';
      default:
        return 'Enable location access to get weather for your current location automatically.';
    }
  };

  return (
    <View style={styles.container}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.content}>
          <View style={styles.iconContainer}>
            <Icon
              source={getStatusIcon()}
              size={64}
              color={getStatusColor()}
            />
          </View>
          
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
            Location Access
          </Text>
          
          <Text variant="bodyLarge" style={[styles.message, { color: theme.colors.onSurface }]}>
            {getStatusMessage()}
          </Text>
          
          <View style={styles.buttonContainer}>
            {permissionStatus.status !== 'granted' && (
              <Button
                mode="contained"
                onPress={onRequestPermission}
                disabled={!permissionStatus.canAskAgain}
                style={styles.button}
              >
                {permissionStatus.status === 'denied' && !permissionStatus.canAskAgain
                  ? 'Open Settings'
                  : 'Allow Location Access'
                }
              </Button>
            )}
            
            <Button
              mode="outlined"
              onPress={onSkip}
              style={styles.button}
            >
              {permissionStatus.status === 'granted' ? 'Continue' : 'Skip for Now'}
            </Button>
          </View>
          
          {permissionStatus.status === 'denied' && !permissionStatus.canAskAgain && (
            <Text variant="bodySmall" style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}>
              To enable location access, please go to Settings > Privacy & Security > Location Services and allow access for SkyePie.
            </Text>
          )}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    elevation: 4,
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    marginVertical: 4,
  },
  helpText: {
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
    lineHeight: 20,
  },
});
