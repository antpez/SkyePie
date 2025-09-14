import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button, FAB, SegmentedButtons } from 'react-native-paper';
import { useThemeContext } from '../../contexts/ThemeContext';
import { performanceMonitor } from '../../utils/performanceMonitor';

interface PerformanceMonitorProps {
  visible?: boolean;
  onClose?: () => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = React.memo(({
  visible = false,
  onClose,
}) => {
  const { theme } = useThemeContext();
  const [stats, setStats] = useState<Map<string, any> | null>(null);
  const [isEnabled, setIsEnabled] = useState(performanceMonitor.isMonitoringEnabled());
  const [logConfig, setLogConfig] = useState(performanceMonitor.getLogConfig());

  const refreshStats = useCallback(() => {
    const currentStats = performanceMonitor.getStats();
    setStats(currentStats as Map<string, any>);
  }, []);

  const clearStats = useCallback(() => {
    performanceMonitor.clearStats();
    setStats(null);
  }, []);

  const toggleMonitoring = useCallback(() => {
    const newEnabled = !isEnabled;
    performanceMonitor.setEnabled(newEnabled);
    setIsEnabled(newEnabled);
  }, [isEnabled]);

  const updateLogLevel = useCallback((level: string) => {
    performanceMonitor.setLogLevel(level as 'none' | 'slow' | 'all');
    setLogConfig(performanceMonitor.getLogConfig());
  }, []);

  const updateLogThreshold = useCallback((threshold: number) => {
    performanceMonitor.setLogThreshold(threshold);
    setLogConfig(performanceMonitor.getLogConfig());
  }, []);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      refreshStats();
      intervalRef.current = setInterval(refreshStats, 1000); // Update every second
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [visible, refreshStats]);

  if (!visible) return null;

  const statsArray = stats ? Array.from(stats.entries()) : [];

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
      <Card style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
              Performance Monitor
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: theme.colors.onSurface }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controls}>
            <Button
              mode={isEnabled ? "contained" : "outlined"}
              onPress={toggleMonitoring}
              style={styles.controlButton}
            >
              {isEnabled ? 'Disable' : 'Enable'} Monitoring
            </Button>
            <Button
              mode="outlined"
              onPress={clearStats}
              style={styles.controlButton}
            >
              Clear Stats
            </Button>
          </View>

          {/* Logging Controls */}
          <View style={styles.loggingControls}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Logging Controls
            </Text>
            
            <View style={styles.logLevelContainer}>
              <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                Log Level:
              </Text>
              <SegmentedButtons
                value={logConfig.level}
                onValueChange={updateLogLevel}
                buttons={[
                  { value: 'none', label: 'None' },
                  { value: 'slow', label: 'Slow Only' },
                  { value: 'all', label: 'All' },
                ]}
                style={styles.segmentedButtons}
              />
            </View>

            <View style={styles.thresholdContainer}>
              <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                Slow Threshold: {logConfig.threshold}ms
              </Text>
              <View style={styles.thresholdButtons}>
                <Button
                  mode="outlined"
                  onPress={() => updateLogThreshold(50)}
                  compact
                >
                  50ms
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => updateLogThreshold(100)}
                  compact
                >
                  100ms
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => updateLogThreshold(200)}
                  compact
                >
                  200ms
                </Button>
              </View>
            </View>
          </View>

          <ScrollView style={styles.statsContainer} showsVerticalScrollIndicator={false}>
            {statsArray.length === 0 ? (
              <Text style={[styles.noData, { color: theme.colors.onSurfaceVariant }]}>
                No performance data available
              </Text>
            ) : (
              statsArray.map(([name, stat]) => (
                <Card key={name} style={[styles.statCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Card.Content>
                    <Text variant="titleMedium" style={[styles.statName, { color: theme.colors.onSurface }]}>
                      {name}
                    </Text>
                    <View style={styles.statDetails}>
                      <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                        Calls: {stat.totalCalls}
                      </Text>
                      <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                        Avg: {stat.averageDuration.toFixed(2)}ms
                      </Text>
                      <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                        Min: {stat.minDuration.toFixed(2)}ms
                      </Text>
                      <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                        Max: {stat.maxDuration.toFixed(2)}ms
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </ScrollView>
        </Card.Content>
      </Card>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  controlButton: {
    flex: 1,
  },
  loggingControls: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  logLevelContainer: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  segmentedButtons: {
    marginTop: 4,
  },
  thresholdContainer: {
    marginBottom: 8,
  },
  thresholdButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  statsContainer: {
    maxHeight: 300,
  },
  noData: {
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  statCard: {
    marginBottom: 8,
  },
  statName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statText: {
    fontSize: 12,
  },
});

PerformanceMonitor.displayName = 'PerformanceMonitor';
