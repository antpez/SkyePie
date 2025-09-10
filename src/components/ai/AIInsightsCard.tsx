import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Chip, IconButton, Divider } from 'react-native-paper';
import { PersonalizedInsight } from '../../types/ai';
import { useThemeContext } from '../../contexts/ThemeContext';

interface AIInsightsCardProps {
  insights: PersonalizedInsight[];
  onDismissInsight?: (insightId: string) => void;
}

export const AIInsightsCard: React.FC<AIInsightsCardProps> = React.memo(({
  insights,
  onDismissInsight
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
      <Card style={cardStyle}>
        <Card.Content>
          <Text variant="titleLarge" style={titleStyle}>
            AI Insights
          </Text>
          <Text variant="bodyMedium" style={subtitleStyle}>
            No personalized insights available at the moment.
          </Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={cardStyle}>
      <Card.Content>
        <Text variant="titleLarge" style={titleStyle}>
          AI Insights
        </Text>
        <Text variant="bodyMedium" style={subtitleStyle}>
          Personalized recommendations based on current weather
        </Text>

        <ScrollView style={styles.insightsContainer} showsVerticalScrollIndicator={false}>
          {insights.map((insight) => (
            <View key={insight.id} style={styles.insightItem}>
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
                  >
                    {insight.priority}
                  </Chip>
                  {onDismissInsight && (
                    <IconButton
                      icon="close"
                      size={16}
                      onPress={() => onDismissInsight(insight.id)}
                    />
                  )}
                </View>
              </View>
              <Divider style={styles.insightDivider} />
            </View>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );
});

AIInsightsCard.displayName = 'AIInsightsCard';

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
  insightsContainer: {
    maxHeight: 300,
  },
  insightItem: {
    marginBottom: 8,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  insightTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  typeIconText: {
    color: 'white',
    fontSize: 16,
  },
  insightTextContainer: {
    flex: 1,
  },
  insightTitle: {
    marginBottom: 4,
  },
  insightMessage: {
    lineHeight: 20,
  },
  insightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityChip: {
    height: 24,
    marginRight: 4,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  insightDivider: {
    marginTop: 8,
  },
});
