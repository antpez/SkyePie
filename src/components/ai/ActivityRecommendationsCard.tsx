import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Chip, Divider } from 'react-native-paper';
import { ActivityRecommendation } from '../../types/ai';
import { useThemeContext } from '../../contexts/ThemeContext';

interface ActivityRecommendationsCardProps {
  recommendations: ActivityRecommendation[];
}

export const ActivityRecommendationsCard: React.FC<ActivityRecommendationsCardProps> = React.memo(({
  recommendations
}) => {
  const { theme } = useThemeContext();

  const cardStyle = [
    styles.card,
    { backgroundColor: theme.colors.surface }
  ];

  const titleStyle = [
    styles.title,
    { color: theme.colors.onSurface }
  ];

  const subtitleStyle = [
    styles.subtitle,
    { color: theme.colors.onSurfaceVariant }
  ];

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
      <Card style={cardStyle}>
        <Card.Content>
          <Text variant="titleLarge" style={titleStyle}>
            Activity Recommendations
          </Text>
          <Text variant="bodyMedium" style={subtitleStyle}>
            No activity recommendations available.
          </Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={cardStyle}>
      <Card.Content>
        <Text variant="titleLarge" style={titleStyle}>
          Activity Recommendations
        </Text>
        <Text variant="bodyMedium" style={subtitleStyle}>
          Perfect activities for today's weather
        </Text>

        <ScrollView style={styles.recommendationsContainer} showsVerticalScrollIndicator={false}>
          {recommendations.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityHeader}>
                <View style={styles.activityTitleContainer}>
                  <Text variant="titleMedium" style={[styles.activityName, { color: theme.colors.onSurface }]}>
                    {activity.activity}
                  </Text>
                  <View style={styles.activityMeta}>
                    <Chip 
                      style={[styles.suitabilityChip, { backgroundColor: getSuitabilityColor(activity.suitability) }]}
                      textStyle={styles.suitabilityText}
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
              
              <Divider style={styles.activityDivider} />
            </View>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );
});

ActivityRecommendationsCard.displayName = 'ActivityRecommendationsCard';

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 2,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 16,
  },
  recommendationsContainer: {
    maxHeight: 400,
  },
  activityItem: {
    marginBottom: 8,
  },
  activityHeader: {
    marginBottom: 4,
  },
  activityTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activityName: {
    fontWeight: 'bold',
    flex: 1,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suitabilityChip: {
    height: 24,
  },
  suitabilityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  locationText: {
    fontSize: 12,
  },
  activityReason: {
    marginBottom: 8,
    lineHeight: 18,
  },
  activityDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailText: {
    fontSize: 11,
  },
  activityDivider: {
    marginTop: 8,
  },
});
