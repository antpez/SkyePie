import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { useThemeContext } from '../../contexts/ThemeContext';
import { Location } from '../../types';
import { getLocationDisplayName } from '../../utils/helpers';

interface LocationCardProps {
  location: Location;
  onPress?: () => void;
  onFavorite?: () => void;
  onRemove?: () => void;
  showActions?: boolean;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onPress,
  onFavorite,
  onRemove,
  showActions = true,
}) => {
  const { effectiveTheme, theme } = useThemeContext();
  const displayName = getLocationDisplayName(location);

  return (
    <Card 
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <Card.Content style={styles.content}>
        <View style={styles.locationInfo}>
          <View style={styles.locationDetails}>
            <Text variant="titleMedium" style={styles.locationName}>
              {displayName}
            </Text>
            <Text variant="bodySmall" style={styles.coordinates}>
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
            {location.isCurrent && (
              <Text variant="bodySmall" style={[styles.currentLabel, { color: theme.colors.primary }]}>
                Current Location
              </Text>
            )}
          </View>
          
          {showActions && (
            <View style={styles.actions}>
              {onFavorite && (
                <IconButton
                  icon={location.isFavorite ? 'heart' : 'heart-outline'}
                  iconColor={location.isFavorite ? theme.colors.error : theme.colors.onSurface}
                  size={20}
                  onPress={onFavorite}
                />
              )}
              {onRemove && !location.isCurrent && (
                <IconButton
                  icon="close"
                  iconColor={theme.colors.onSurface}
                  size={20}
                  onPress={onRemove}
                />
              )}
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    marginHorizontal: 16,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationDetails: {
    flex: 1,
  },
  locationName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  coordinates: {
    opacity: 0.7,
    marginBottom: 2,
  },
  currentLabel: {
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
