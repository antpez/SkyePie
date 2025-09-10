import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useThemeContext } from '../../contexts/ThemeContext';

interface WeatherSkeletonProps {
  showDetails?: boolean;
}

export const WeatherSkeleton: React.FC<WeatherSkeletonProps> = ({ showDetails = true }) => {
  const { theme } = useThemeContext();
  const shimmerAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnimation]);

  const shimmerStyle = {
    opacity: shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  const SkeletonBox = ({ width, height, style = {} }: { width: number | string; height: number; style?: any }) => (
    <Animated.View
      style={[
        styles.skeletonBox,
        {
          width,
          height,
          backgroundColor: theme.colors.surfaceVariant,
        },
        shimmerStyle,
        style,
      ]}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Main weather card skeleton */}
      <View style={[styles.weatherCard, { backgroundColor: theme.colors.surface }]}>
        {/* Location and time */}
        <View style={styles.headerRow}>
          <SkeletonBox width={120} height={20} />
          <SkeletonBox width={80} height={16} />
        </View>

        {/* Temperature and icon */}
        <View style={styles.temperatureRow}>
          <SkeletonBox width={100} height={80} style={styles.temperatureBox} />
          <SkeletonBox width={80} height={80} style={styles.iconBox} />
        </View>

        {/* Weather description */}
        <SkeletonBox width={150} height={20} style={styles.descriptionBox} />

        {/* Weather details grid */}
        {showDetails && (
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <SkeletonBox width={60} height={16} />
              <SkeletonBox width={40} height={20} />
            </View>
            <View style={styles.detailItem}>
              <SkeletonBox width={60} height={16} />
              <SkeletonBox width={40} height={20} />
            </View>
            <View style={styles.detailItem}>
              <SkeletonBox width={60} height={16} />
              <SkeletonBox width={40} height={20} />
            </View>
            <View style={styles.detailItem}>
              <SkeletonBox width={60} height={16} />
              <SkeletonBox width={40} height={20} />
            </View>
          </View>
        )}
      </View>

      {/* Forecast skeleton */}
      <View style={[styles.forecastCard, { backgroundColor: theme.colors.surface }]}>
        <SkeletonBox width={100} height={20} style={styles.forecastTitle} />
        <View style={styles.forecastItems}>
          {[1, 2, 3, 4, 5].map((item) => (
            <View key={item} style={styles.forecastItem}>
              <SkeletonBox width={60} height={16} />
              <SkeletonBox width={40} height={40} style={styles.forecastIcon} />
              <SkeletonBox width={50} height={16} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  weatherCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  temperatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  temperatureBox: {
    borderRadius: 8,
  },
  iconBox: {
    borderRadius: 40,
  },
  descriptionBox: {
    alignSelf: 'center',
    borderRadius: 4,
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  forecastCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  forecastTitle: {
    marginBottom: 16,
    borderRadius: 4,
  },
  forecastItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forecastItem: {
    alignItems: 'center',
    flex: 1,
  },
  forecastIcon: {
    borderRadius: 20,
    marginVertical: 8,
  },
  skeletonBox: {
    borderRadius: 4,
  },
});
