import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, List, Chip, IconButton } from 'react-native-paper';
import { useThemeContext } from '../../contexts/ThemeContext';
import { WeatherAlert } from '../../types';

interface WeatherAlertsProps {
  alerts: WeatherAlert[];
  onDismiss?: (alertId: string) => void;
}

export const WeatherAlerts: React.FC<WeatherAlertsProps> = ({ alerts, onDismiss }) => {
  const { effectiveTheme, theme } = useThemeContext();

  // Show a message that weather alerts are not available with free tier
  if (!alerts || alerts.length === 0) {
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.content}>
          <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            Weather Alerts
          </Text>
          <Text variant="bodyMedium" style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
            Weather alerts require a paid OpenWeatherMap subscription and are not available with the free API tier.
          </Text>
        </Card.Content>
      </Card>
    );
  }

  const getSeverityColor = (event: string): string => {
    const eventLower = event.toLowerCase();
    
    if (eventLower.includes('warning') || eventLower.includes('severe')) {
      return theme.colors.error;
    }
    if (eventLower.includes('watch') || eventLower.includes('advisory')) {
      return '#FF9800'; // Orange
    }
    if (eventLower.includes('statement') || eventLower.includes('outlook')) {
      return '#2196F3'; // Blue
    }
    
    return theme.colors.primary;
  };

  const getSeverityIcon = (event: string): string => {
    const eventLower = event.toLowerCase();
    
    if (eventLower.includes('tornado') || eventLower.includes('hurricane')) {
      return 'weather-tornado';
    }
    if (eventLower.includes('flood')) {
      return 'weather-flood';
    }
    if (eventLower.includes('snow') || eventLower.includes('blizzard')) {
      return 'weather-snowy';
    }
    if (eventLower.includes('wind')) {
      return 'weather-windy';
    }
    if (eventLower.includes('thunderstorm') || eventLower.includes('storm')) {
      return 'weather-lightning';
    }
    if (eventLower.includes('heat') || eventLower.includes('fire')) {
      return 'weather-sunny';
    }
    
    return 'alert-circle';
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderAlert = (alert: WeatherAlert, index: number) => {
    const severityColor = getSeverityColor(alert.event);
    const icon = getSeverityIcon(alert.event);
    
    return (
      <Card 
        key={`${alert.event}-${alert.start}-${index}`}
        style={[styles.alertCard, { backgroundColor: theme.colors.surface }]}
      >
        <Card.Content>
          <View style={styles.alertHeader}>
            <View style={styles.alertTitleContainer}>
              <List.Icon 
                icon={icon} 
                color={severityColor}
              />
              <Text 
                variant="titleMedium" 
                style={[styles.alertTitle, { color: theme.colors.onSurface }]}
              >
                {alert.event}
              </Text>
            </View>
            {onDismiss && (
              <IconButton
                icon="close"
                size={20}
                onPress={() => onDismiss(`${alert.event}-${alert.start}`)}
                iconColor={theme.colors.onSurfaceVariant}
              />
            )}
          </View>
          
          <Text 
            variant="bodyMedium" 
            style={[styles.alertDescription, { color: theme.colors.onSurface }]}
          >
            {alert.description}
          </Text>
          
          <View style={styles.alertFooter}>
            <View style={styles.alertTimeContainer}>
              <Text 
                variant="bodySmall" 
                style={[styles.alertTime, { color: theme.colors.onSurfaceVariant }]}
              >
                From: {formatDate(alert.start)}
              </Text>
              <Text 
                variant="bodySmall" 
                style={[styles.alertTime, { color: theme.colors.onSurfaceVariant }]}
              >
                Until: {formatDate(alert.end)}
              </Text>
            </View>
            
            {alert.sender_name && (
              <Chip 
                mode="outlined" 
                compact
                style={[styles.senderChip, { borderColor: severityColor }]}
                textStyle={{ color: severityColor }}
              >
                {alert.sender_name}
              </Chip>
            )}
          </View>
          
          {alert.tags && alert.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {alert.tags.map((tag, tagIndex) => (
                <Chip 
                  key={tagIndex}
                  mode="outlined" 
                  compact
                  style={[styles.tagChip, { borderColor: theme.colors.outline }]}
                  textStyle={{ color: theme.colors.onSurfaceVariant }}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container} key={`weather-alerts-${effectiveTheme}`}>
      <Text 
        variant="headlineSmall" 
        style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
      >
        Weather Alerts
      </Text>
      {alerts.map((alert, index) => renderAlert(alert, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  card: {
    marginVertical: 4,
    marginHorizontal: 16,
  },
  content: {
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    lineHeight: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  alertCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
    flex: 1,
  },
  alertDescription: {
    lineHeight: 20,
    marginBottom: 12,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTimeContainer: {
    flex: 1,
  },
  alertTime: {
    fontSize: 12,
  },
  senderChip: {
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tagChip: {
    marginRight: 4,
    marginBottom: 4,
  },
});
