import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Chip, Divider } from 'react-native-paper';
import { ClothingRecommendation } from '../../types/ai';
import { useThemeContext } from '../../contexts/ThemeContext';

interface ClothingRecommendationsCardProps {
  recommendations: ClothingRecommendation[];
}

export const ClothingRecommendationsCard: React.FC<ClothingRecommendationsCardProps> = React.memo(({
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'essential': return theme.colors.error;
      case 'recommended': return theme.colors.primary;
      case 'optional': return theme.colors.outline;
      default: return theme.colors.outline;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'top': return '👕';
      case 'bottom': return '👖';
      case 'outerwear': return '🧥';
      case 'accessories': return '🧣';
      case 'footwear': return '👟';
      default: return '👔';
    }
  };

  const groupByCategory = (recs: ClothingRecommendation[]) => {
    return recs.reduce((groups, rec) => {
      if (!groups[rec.category]) {
        groups[rec.category] = [];
      }
      groups[rec.category].push(rec);
      return groups;
    }, {} as Record<string, ClothingRecommendation[]>);
  };

  const groupedRecommendations = groupByCategory(recommendations);

  if (recommendations.length === 0) {
    return (
      <Card style={cardStyle}>
        <Card.Content>
          <Text variant="titleLarge" style={titleStyle}>
            Clothing Recommendations
          </Text>
          <Text variant="bodyMedium" style={subtitleStyle}>
            No clothing recommendations available.
          </Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={cardStyle}>
      <Card.Content>
        <Text variant="titleLarge" style={titleStyle}>
          Clothing Recommendations
        </Text>
        <Text variant="bodyMedium" style={subtitleStyle}>
          Smart suggestions based on current weather
        </Text>

        <ScrollView style={styles.recommendationsContainer} showsVerticalScrollIndicator={false}>
          {Object.entries(groupedRecommendations).map(([category, items]) => (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text variant="titleMedium" style={[styles.categoryTitle, { color: theme.colors.onSurface }]}>
                  {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </View>
              
              {items.map((item, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <View style={styles.recommendationContent}>
                    <Text variant="bodyMedium" style={[styles.itemName, { color: theme.colors.onSurface }]}>
                      {item.item}
                    </Text>
                    <Text variant="bodySmall" style={[styles.itemReason, { color: theme.colors.onSurfaceVariant }]}>
                      {item.reason}
                    </Text>
                  </View>
                  <Chip 
                    style={[styles.priorityChip, { backgroundColor: getPriorityColor(item.priority) }]}
                    textStyle={styles.priorityText}
                  >
                    {item.priority}
                  </Chip>
                </View>
              ))}
              
              <Divider style={styles.categoryDivider} />
            </View>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );
});

ClothingRecommendationsCard.displayName = 'ClothingRecommendationsCard';

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
  categorySection: {
    marginBottom: 8,
  },
  categoryHeader: {
    marginBottom: 8,
  },
  categoryTitle: {
    fontWeight: 'bold',
  },
  recommendationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 8,
  },
  recommendationContent: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontWeight: '500',
    marginBottom: 2,
  },
  itemReason: {
    lineHeight: 16,
  },
  priorityChip: {
    height: 24,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  categoryDivider: {
    marginTop: 8,
  },
});
