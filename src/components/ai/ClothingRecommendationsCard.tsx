import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Chip, Divider } from 'react-native-paper';
import { ClothingRecommendation } from '../../types/ai';
import { useThemeContext } from '../../contexts/ThemeContext';
import { ConsistentCard } from '../common';

interface ClothingRecommendationsCardProps {
  recommendations: ClothingRecommendation[];
}

export const ClothingRecommendationsCard: React.FC<ClothingRecommendationsCardProps> = React.memo(({
  recommendations
}) => {
  const { theme } = useThemeContext();

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
      <ConsistentCard>
        <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
          👕 Clothing Recommendations
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          No clothing recommendations available at the moment.
        </Text>
        <Text variant="bodySmall" style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
          Check back when weather conditions change for personalized suggestions.
        </Text>
      </ConsistentCard>
    );
  }

  return (
    <ConsistentCard>
      <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
        👕 Clothing Recommendations
      </Text>
      <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        Smart suggestions based on current weather conditions
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
              <View 
                key={index} 
                style={[styles.recommendationItem, { backgroundColor: theme.colors.surfaceVariant + '20' }]}
                accessible={true}
                accessibilityLabel={`${item.item}, ${item.priority} priority, ${item.reason}`}
                accessibilityRole="button"
              >
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
                  accessible={true}
                  accessibilityLabel={`${item.priority} priority`}
                >
                  {item.priority}
                </Chip>
              </View>
            ))}
            
            <Divider style={[styles.categoryDivider, { backgroundColor: theme.colors.outline }]} />
          </View>
        ))}
      </ScrollView>
    </ConsistentCard>
  );
});

ClothingRecommendationsCard.displayName = 'ClothingRecommendationsCard';

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
    alignItems: 'center',
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 60,
  },
  recommendationContent: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontWeight: '500',
    marginBottom: 4,
    fontSize: 16,
  },
  itemReason: {
    lineHeight: 18,
    fontSize: 14,
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
  categoryDivider: {
    marginTop: 8,
  },
});
