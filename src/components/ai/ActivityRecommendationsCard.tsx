import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Chip, Divider } from 'react-native-paper';
import { ActivityRecommendation } from '../../types/ai';
import { useThemeContext } from '../../contexts/ThemeContext';
import { ConsistentCard } from '../common';

interface ActivityRecommendationsCardProps {
  recommendations: ActivityRecommendation[];
}

export const ActivityRecommendationsCard: React.FC<ActivityRecommendationsCardProps> = React.memo(({
  recommendations
}) => {
  const { theme } = useThemeContext();

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case 'excellent': return '#4CAF50';
      case 'good': return '#8BC34A';
      case 'fair': return '#FF9800';
      case 'poor': return '#F44336';
      default: return theme.colors.outline;
    }
  };

  const getSuitabilityIcon = (suitability: string) => {
    switch (suitability) {
      case 'excellent': return '⭐';
      case 'good': return '👍';
      case 'fair': return '⚠️';
      case 'poor': return '❌';
      default: return '❓';
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'indoor': return '🏠';
      case 'outdoor': return '🌳';
      case 'both': return '🏠🌳';
      default: return '📍';
    }
  };

  if (recommendations.length === 0) {
    return (
      <ConsistentCard>
        <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
          🎯 Activity Recommendations
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          No activity recommendations available at the moment.
        </Text>
        <Text variant="bodySmall" style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
          Check back when weather conditions change for personalized activity suggestions.
        </Text>
      </ConsistentCard>
    );
  }

  return (
    <ConsistentCard>
      <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
        🎯 Activity Recommendations
      </Text>
      <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        Perfect activities for today's weather conditions
      </Text>

      <ScrollView style={styles.recommendationsContainer} showsVerticalScrollIndicator={false}>
        {recommendations.map((activity, index) => (
          <View 
            key={index} 
            style={[styles.activityItem, { backgroundColor: theme.colors.surfaceVariant + '20' }]}
            accessible={true}
            accessibilityLabel={`${activity.activity}, ${activity.suitability} suitability, ${activity.reason}`}
            accessibilityRole="button"
          >
            <View style={styles.activityHeader}>
              <View style={styles.activityTitleContainer}>
                <Text variant="titleMedium" style={[styles.activityName, { color: theme.colors.onSurface }]}>
                  {activity.activity}
                </Text>
                <View style={styles.activityMeta}>
                  <Chip 
                    style={[styles.suitabilityChip, { backgroundColor: getSuitabilityColor(activity.suitability) }]}
                    textStyle={styles.suitabilityText}
                    accessible={true}
                    accessibilityLabel={`${activity.suitability} suitability`}
                  >
                    {getSuitabilityIcon(activity.suitability)} {activity.suitability}
                  </Chip>
                  <Text variant="bodySmall" style={[styles.locationText, { color: theme.colors.onSurfaceVariant }]}>
                    {getLocationIcon(activity.location || 'both')} {activity.location || 'both'}
                  </Text>
                </View>
              </View>
            </View>
            
            <Text variant="bodyMedium" style={[styles.activityReason, { color: theme.colors.onSurfaceVariant }]}>
              {activity.reason}
            </Text>
            
            <View style={styles.activityDetails}>
              {activity.duration && (
                <Text variant="bodySmall" style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                  ⏱️ {activity.duration}
                </Text>
              )}
              {activity.equipment && activity.equipment.length > 0 && (
                <Text variant="bodySmall" style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                  🎒 {activity.equipment.join(', ')}
                </Text>
              )}
            </View>
            
            <Divider style={[styles.activityDivider, { backgroundColor: theme.colors.outline }]} />
          </View>
        ))}
      </ScrollView>
    </ConsistentCard>
  );
});

ActivityRecommendationsCard.displayName = 'ActivityRecommendationsCard';

const styles = StyleSheet.create({
  title: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  subtitle: {
    marginBottom: 8,
  },
  emptySubtext: {
    marginBottom: 16,
    lineHeight: 20,
    fontSize: 14,
  },
  recommendationsContainer: {
    maxHeight: 400,
  },
  activityItem: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 80,
  },
  activityHeader: {
    marginBottom: 8,
  },
  activityTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityName: {
    fontWeight: 'bold',
    flex: 1,
    fontSize: 16,
    marginRight: 12,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suitabilityChip: {
    height: 28,
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suitabilityText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
  },
  activityReason: {
    marginBottom: 8,
    lineHeight: 20,
    fontSize: 14,
  },
  activityDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    lineHeight: 16,
  },
  activityDivider: {
    marginTop: 8,
  },
});
