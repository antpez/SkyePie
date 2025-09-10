import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, List, Divider, Icon } from 'react-native-paper';
import { WeatherHealthTips } from '../../types/health';
import { useThemeContext } from '../../contexts/ThemeContext';

interface WeatherTipsCardProps {
  tips: WeatherHealthTips;
}

export const WeatherTipsCard: React.FC<WeatherTipsCardProps> = React.memo(({
  tips
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

  const getIcon = (category: string) => {
    switch (category) {
      case 'temperature': return 'thermometer';
      case 'humidity': return 'water';
      case 'wind': return 'weather-windy';
      case 'precipitation': return 'weather-rainy';
      default: return 'lightbulb-outline';
    }
  };

  const renderTipsSection = (category: string, tipsList: string[]) => {
    if (tipsList.length === 0) return null;

    return (
      <View key={category} style={styles.section}>
        <List.Item
          title={category.charAt(0).toUpperCase() + category.slice(1)}
          left={(props) => <List.Icon {...props} icon={getIcon(category)} />}
          titleStyle={[styles.sectionTitle, { color: theme.colors.onSurface }]}
        />
        <View style={styles.tipsContainer}>
          {tipsList.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text variant="bodySmall" style={[styles.bullet, { color: theme.colors.primary }]}>
                •
              </Text>
              <Text variant="bodySmall" style={[styles.tipText, { color: theme.colors.onSurfaceVariant }]}>
                {tip}
              </Text>
            </View>
          ))}
        </View>
        <Divider style={styles.divider} />
      </View>
    );
  };

  return (
    <Card style={cardStyle}>
      <Card.Content>
        <Text variant="titleLarge" style={titleStyle}>
          Health Tips
        </Text>

        {renderTipsSection('temperature', tips.temperature)}
        {renderTipsSection('humidity', tips.humidity)}
        {renderTipsSection('wind', tips.wind)}
        {renderTipsSection('precipitation', tips.precipitation)}
        {renderTipsSection('general', tips.general)}
      </Card.Content>
    </Card>
  );
});

WeatherTipsCard.displayName = 'WeatherTipsCard';

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 2,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 4,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  tipsContainer: {
    marginLeft: 16,
    marginTop: 4,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bullet: {
    marginRight: 8,
    marginTop: 2,
    fontWeight: 'bold',
  },
  tipText: {
    flex: 1,
    lineHeight: 18,
  },
  divider: {
    marginVertical: 8,
  },
});
