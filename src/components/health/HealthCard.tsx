import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, Divider, IconButton } from 'react-native-paper';
import { UVIndex, AirQuality, PollenData, HealthAlert } from '../../types/health';
import { useThemeContext } from '../../contexts/ThemeContext';

interface HealthCardProps {
  uvIndex: UVIndex;
  airQuality: AirQuality;
  pollenData: PollenData;
  healthAlerts: HealthAlert[];
  onDismissAlert?: (alertId: string) => void;
}

export const HealthCard: React.FC<HealthCardProps> = React.memo(({
  uvIndex,
  airQuality,
  pollenData,
  healthAlerts,
  onDismissAlert
}) => {
  const { theme } = useThemeContext();

  const getUVColor = (value: number) => {
    if (value <= 2) return '#4CAF50';
    if (value <= 5) return '#FFEB3B';
    if (value <= 7) return '#FF9800';
    if (value <= 10) return '#F44336';
    return '#9C27B0';
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#4CAF50';
    if (aqi <= 100) return '#FFEB3B';
    if (aqi <= 150) return '#FF9800';
    if (aqi <= 200) return '#F44336';
    if (aqi <= 300) return '#9C27B0';
    return '#E91E63';
  };

  const getPollenColor = (overall: number) => {
    if (overall <= 2) return '#4CAF50';
    if (overall <= 4) return '#FFEB3B';
    if (overall <= 6) return '#FF9800';
    if (overall <= 8) return '#F44336';
    return '#9C27B0';
  };

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
          Health & Wellness
        </Text>

        {/* UV Index */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={titleStyle}>
              UV Index
            </Text>
            <Chip 
              style={[styles.chip, { backgroundColor: getUVColor(uvIndex.value) }]}
              textStyle={styles.chipText}
            >
              {uvIndex.value} - {uvIndex.category}
            </Chip>
          </View>
          <Text variant="bodyMedium" style={subtitleStyle}>
            {uvIndex.description}
          </Text>
          <Text variant="bodySmall" style={subtitleStyle}>
            Protection time: {uvIndex.protectionTime} minutes
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* Air Quality */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={titleStyle}>
              Air Quality
            </Text>
            <Chip 
              style={[styles.chip, { backgroundColor: getAQIColor(airQuality.aqi) }]}
              textStyle={styles.chipText}
            >
              AQI {airQuality.aqi} - {airQuality.category}
            </Chip>
          </View>
          <Text variant="bodySmall" style={subtitleStyle}>
            PM2.5: {airQuality.pollutants.pm25} | PM10: {airQuality.pollutants.pm10} | O₃: {airQuality.pollutants.o3}
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* Pollen Count */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={titleStyle}>
              Pollen Count
            </Text>
            <Chip 
              style={[styles.chip, { backgroundColor: getPollenColor(pollenData.overall) }]}
              textStyle={styles.chipText}
            >
              {pollenData.overall} - {pollenData.category}
            </Chip>
          </View>
          <View style={styles.pollenBreakdown}>
            <Text variant="bodySmall" style={subtitleStyle}>
              Grass: {pollenData.grass} | Tree: {pollenData.tree} | Weed: {pollenData.weed} | Mold: {pollenData.mold}
            </Text>
          </View>
        </View>

        {/* Health Alerts */}
        {healthAlerts.length > 0 && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.section}>
              <Text variant="titleMedium" style={titleStyle}>
                Health Alerts
              </Text>
              {healthAlerts.map((alert) => (
                <View key={alert.id} style={styles.alertItem}>
                  <View style={styles.alertContent}>
                    <Text variant="bodyMedium" style={[styles.alertTitle, { color: theme.colors.error }]}>
                      {alert.title}
                    </Text>
                    <Text variant="bodySmall" style={subtitleStyle}>
                      {alert.message}
                    </Text>
                    <View style={styles.recommendations}>
                      {alert.recommendations.map((rec, index) => (
                        <Text key={index} variant="bodySmall" style={subtitleStyle}>
                          • {rec}
                        </Text>
                      ))}
                    </View>
                  </View>
                  {onDismissAlert && (
                    <IconButton
                      icon="close"
                      size={16}
                      onPress={() => onDismissAlert(alert.id)}
                    />
                  )}
                </View>
              ))}
            </View>
          </>
        )}
      </Card.Content>
    </Card>
  );
});

HealthCard.displayName = 'HealthCard';

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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chip: {
    height: 28,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 8,
  },
  pollenBreakdown: {
    marginTop: 4,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    padding: 8,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 8,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recommendations: {
    marginTop: 4,
  },
});
