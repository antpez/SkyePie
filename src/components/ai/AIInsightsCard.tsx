import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Chip, IconButton, Divider } from 'react-native-paper';
import { PersonalizedInsight } from '../../types/ai';
import { useThemeContext } from '../../contexts/ThemeContext';
import { ConsistentCard } from '../common';

interface AIInsightsCardProps {
  insights: PersonalizedInsight[];
  onDismissInsight?: (insightId: string) => void;
}

export const AIInsightsCard: React.FC<AIInsightsCardProps> = React.memo(({
  insights,
  onDismissInsight
}) => {
  const { theme } = useThemeContext();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.primary;
      case 'low': return theme.colors.outline;
      default: return theme.colors.outline;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'clothing': return 'tshirt-crew';
      case 'activity': return 'run';
      case 'pattern': return 'chart-line';
      case 'mood': return 'emoticon-happy';
      case 'health': return 'heart-pulse';
      default: return 'lightbulb-outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'clothing': return '#FF9800';
      case 'activity': return '#4CAF50';
      case 'pattern': return '#2196F3';
      case 'mood': return '#E91E63';
      case 'health': return '#F44336';
      default: return theme.colors.primary;
    }
  };

  if (insights.length === 0) {
    return (
      <ConsistentCard>
        <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
          🤖 AI Insights
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          No personalized insights available at the moment.
        </Text>
        <Text variant="bodySmall" style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
          AI will analyze weather patterns and provide personalized recommendations soon.
        </Text>
      </ConsistentCard>
    );
  }

  return (
    <ConsistentCard>
      <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
        🤖 AI Insights
      </Text>
      <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        Personalized recommendations based on current weather patterns
      </Text>

      <ScrollView style={styles.insightsContainer} showsVerticalScrollIndicator={false}>
        {insights.map((insight) => (
          <View 
            key={insight.id} 
            style={[styles.insightItem, { backgroundColor: theme.colors.surfaceVariant + '20' }]}
            accessible={true}
            accessibilityLabel={`${insight.title}, ${insight.priority} priority, ${insight.message}`}
            accessibilityRole="button"
          >
            <View style={styles.insightHeader}>
              <View style={styles.insightTitleContainer}>
                <View style={[styles.typeIcon, { backgroundColor: getTypeColor(insight.type) }]}>
                  <Text style={styles.typeIconText}>
                    {getTypeIcon(insight.type)}
                  </Text>
                </View>
                <View style={styles.insightTextContainer}>
                  <Text variant="titleMedium" style={[styles.insightTitle, { color: theme.colors.onSurface }]}>
                    {insight.title}
                  </Text>
                  <Text variant="bodyMedium" style={[styles.insightMessage, { color: theme.colors.onSurfaceVariant }]}>
                    {insight.message}
                  </Text>
                </View>
              </View>
              <View style={styles.insightActions}>
                <Chip 
                  style={[styles.priorityChip, { backgroundColor: getPriorityColor(insight.priority) }]}
                  textStyle={styles.priorityText}
                  accessible={true}
                  accessibilityLabel={`${insight.priority} priority`}
                >
                  {insight.priority}
                </Chip>
                {onDismissInsight && (
                  <IconButton
                    icon="close"
                    size={16}
                    onPress={() => onDismissInsight(insight.id)}
                    accessible={true}
                    accessibilityLabel={`Dismiss ${insight.title} insight`}
                  />
                )}
              </View>
            </View>
            <Divider style={[styles.insightDivider, { backgroundColor: theme.colors.outline }]} />
          </View>
        ))}
      </ScrollView>
    </ConsistentCard>
  );
});

AIInsightsCard.displayName = 'AIInsightsCard';

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
  insightsContainer: {
    maxHeight: 300,
  },
  insightItem: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 80,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  typeIconText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  insightTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  insightTitle: {
    marginBottom: 4,
    fontSize: 16,
    fontWeight: 'bold',
  },
  insightMessage: {
    lineHeight: 20,
    fontSize: 14,
  },
  insightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityChip: {
    height: 28,
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  insightDivider: {
    marginTop: 8,
  },
});
