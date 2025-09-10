import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, List, Divider } from 'react-native-paper';
import { SkinProtection } from '../../types/health';
import { useThemeContext } from '../../contexts/ThemeContext';

interface SkinProtectionCardProps {
  skinProtection: SkinProtection;
}

export const SkinProtectionCard: React.FC<SkinProtectionCardProps> = React.memo(({
  skinProtection
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

  return (
    <Card style={cardStyle}>
      <Card.Content>
        <Text variant="titleLarge" style={titleStyle}>
          Sun Protection
        </Text>

        {/* SPF Recommendation */}
        <View style={styles.section}>
          <View style={styles.spfContainer}>
            <Text variant="titleMedium" style={titleStyle}>
              Recommended SPF
            </Text>
            <Chip 
              style={[styles.spfChip, { backgroundColor: theme.colors.primary }]}
              textStyle={styles.chipText}
            >
              SPF {skinProtection.spf}
            </Chip>
          </View>
          <Text variant="bodyMedium" style={subtitleStyle}>
            Reapply every {skinProtection.reapplyTime} minutes
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* Clothing Recommendations */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={titleStyle}>
            Clothing
          </Text>
          <View style={styles.recommendationsContainer}>
            {skinProtection.clothing.map((item, index) => (
              <Chip 
                key={index}
                style={[styles.recommendationChip, { backgroundColor: theme.colors.surfaceVariant }]}
                textStyle={[styles.recommendationText, { color: theme.colors.onSurfaceVariant }]}
              >
                {item}
              </Chip>
            ))}
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Accessories */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={titleStyle}>
            Accessories
          </Text>
          <View style={styles.recommendationsContainer}>
            {skinProtection.accessories.map((item, index) => (
              <Chip 
                key={index}
                style={[styles.recommendationChip, { backgroundColor: theme.colors.surfaceVariant }]}
                textStyle={[styles.recommendationText, { color: theme.colors.onSurfaceVariant }]}
              >
                {item}
              </Chip>
            ))}
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Timing */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={titleStyle}>
            Timing
          </Text>
          <View style={styles.timingContainer}>
            <View style={styles.timingItem}>
              <Text variant="bodyMedium" style={[styles.timingLabel, { color: theme.colors.error }]}>
                Avoid Sun:
              </Text>
              <Text variant="bodyMedium" style={subtitleStyle}>
                {skinProtection.timing.avoid}
              </Text>
            </View>
            <View style={styles.timingItem}>
              <Text variant="bodyMedium" style={[styles.timingLabel, { color: theme.colors.primary }]}>
                Best Time:
              </Text>
              <Text variant="bodyMedium" style={subtitleStyle}>
                {skinProtection.timing.best}
              </Text>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
});

SkinProtectionCard.displayName = 'SkinProtectionCard';

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
  spfContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  spfChip: {
    height: 32,
  },
  chipText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 8,
  },
  recommendationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  recommendationChip: {
    height: 28,
  },
  recommendationText: {
    fontSize: 12,
  },
  timingContainer: {
    marginTop: 4,
  },
  timingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timingLabel: {
    fontWeight: 'bold',
  },
});
