import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Switch, Divider, Text, Card, Snackbar } from 'react-native-paper';
import { useThemeContext } from '../../src/contexts/ThemeContext';

export default function SettingsScreen() {
  const { themeMode, setTheme, effectiveTheme, isLoading, theme } = useThemeContext();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create description text to avoid template literal issues
  const getThemeDescription = () => {
    if (isLoading) return 'Loading...';
    if (!themeMode) return 'Unknown';
    
    const baseDescription = `Current: ${themeMode}`;
    if (themeMode === 'system' && effectiveTheme) {
      return `${baseDescription} (${effectiveTheme})`;
    }
    return baseDescription;
  };
  
  const themeDescription = getThemeDescription();

  const handleThemeChange = useCallback(async (newTheme: 'light' | 'dark' | 'system') => {
    if (!isLoading) {
      try {
        await setTheme(newTheme);
        setSnackbarVisible(true);
      } catch (error) {
        console.error('Error changing theme:', error);
        setSnackbarVisible(true);
        setError('Failed to change theme. Please try again.');
      }
    }
  }, [setTheme, isLoading]);

  // Memoized values for performance
  const containerStyle = useMemo(() => [
    styles.container, 
    { backgroundColor: theme.colors.background }
  ], [theme.colors.background, effectiveTheme]);
  
  const cardStyle = useMemo(() => [
    styles.card, 
    { backgroundColor: theme.colors.surface }
  ], [theme.colors.surface, effectiveTheme]);
  
  const sectionTitleStyle = useMemo(() => [
    styles.sectionTitle,
    { color: theme.colors.onSurface }
  ], [theme.colors.onSurface, effectiveTheme]);
  
  const selectedThemeTextStyle = useMemo(() => [
    styles.selectedThemeText,
    { color: theme.colors.primary }
  ], [theme.colors.primary, effectiveTheme]);

  const selectedThemeStyle = useMemo(() => [
    styles.selectedTheme,
    { 
      backgroundColor: theme.colors.primary + '15',
      borderColor: theme.colors.primary + '30'
    }
  ], [theme.colors.primary, effectiveTheme]);

  return (
    <ScrollView style={containerStyle} key={`settings-${effectiveTheme}-${themeMode}`}>
      <Card style={cardStyle}>
        <Card.Content>
          <Text variant="titleLarge" style={sectionTitleStyle}>
            Appearance
          </Text>
          
          <List.Item
            title="Theme"
            description={themeDescription}
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <View style={styles.themeOptions}>
                <List.Item
                  title="Light"
                  onPress={() => handleThemeChange('light')}
                  disabled={isLoading}
                  style={[
                    styles.themeOption,
                    themeMode === 'light' && selectedThemeStyle,
                    isLoading && styles.disabledOption
                  ]}
                  titleStyle={[
                    styles.themeOptionText,
                    { color: theme.colors.onSurface },
                    themeMode === 'light' && selectedThemeTextStyle,
                    isLoading && styles.disabledText
                  ]}
                />
                <List.Item
                  title="Dark"
                  onPress={() => handleThemeChange('dark')}
                  disabled={isLoading}
                  style={[
                    styles.themeOption,
                    themeMode === 'dark' && selectedThemeStyle,
                    isLoading && styles.disabledOption
                  ]}
                  titleStyle={[
                    styles.themeOptionText,
                    { color: theme.colors.onSurface },
                    themeMode === 'dark' && selectedThemeTextStyle,
                    isLoading && styles.disabledText
                  ]}
                />
                <List.Item
                  title="System"
                  onPress={() => handleThemeChange('system')}
                  disabled={isLoading}
                  style={[
                    styles.themeOption,
                    themeMode === 'system' && selectedThemeStyle,
                    isLoading && styles.disabledOption
                  ]}
                  titleStyle={[
                    styles.themeOptionText,
                    { color: theme.colors.onSurface },
                    themeMode === 'system' && selectedThemeTextStyle,
                    isLoading && styles.disabledText
                  ]}
                />
              </View>
            )}
          />
        </Card.Content>
      </Card>

      <Card style={cardStyle}>
        <Card.Content>
          <Text variant="titleLarge" style={sectionTitleStyle}>
            Weather Units
          </Text>
          
          <List.Item
            title="Temperature"
            description="Celsius or Fahrenheit"
            left={(props) => <List.Icon {...props} icon="thermometer" />}
            right={() => <Text style={{ color: theme.colors.onSurface }}>°C</Text>}
          />
          
          <Divider />
          
          <List.Item
            title="Wind Speed"
            description="km/h, mph, or m/s"
            left={(props) => <List.Icon {...props} icon="weather-windy" />}
            right={() => <Text style={{ color: theme.colors.onSurface }}>km/h</Text>}
          />
          
          <Divider />
          
          <List.Item
            title="Pressure"
            description="hPa, inHg, or mb"
            left={(props) => <List.Icon {...props} icon="gauge" />}
            right={() => <Text style={{ color: theme.colors.onSurface }}>hPa</Text>}
          />
        </Card.Content>
      </Card>

      <Card style={cardStyle}>
        <Card.Content>
          <Text variant="titleLarge" style={sectionTitleStyle}>
            Display Options
          </Text>
          
          <List.Item
            title="Show Feels Like"
            description="Display feels like temperature"
            left={(props) => <List.Icon {...props} icon="thermometer-lines" />}
            right={() => <Switch value={true} />}
          />
          
          <Divider />
          
          <List.Item
            title="Show Humidity"
            description="Display humidity percentage"
            left={(props) => <List.Icon {...props} icon="water" />}
            right={() => <Switch value={true} />}
          />
          
          <Divider />
          
          <List.Item
            title="Show Wind Speed"
            description="Display wind speed and direction"
            left={(props) => <List.Icon {...props} icon="weather-windy" />}
            right={() => <Switch value={true} />}
          />
          
          <Divider />
          
          <List.Item
            title="Show Pressure"
            description="Display atmospheric pressure"
            left={(props) => <List.Icon {...props} icon="gauge" />}
            right={() => <Switch value={false} />}
          />
        </Card.Content>
      </Card>

      <Card style={cardStyle}>
        <Card.Content>
          <Text variant="titleLarge" style={sectionTitleStyle}>
            Notifications
          </Text>
          
          <List.Item
            title="Weather Alerts"
            description="Receive severe weather notifications"
            left={(props) => <List.Icon {...props} icon="alert" />}
            right={() => <Switch value={true} />}
          />
          
          <Divider />
          
          <List.Item
            title="Daily Forecast"
            description="Get daily weather updates"
            left={(props) => <List.Icon {...props} icon="calendar-today" />}
            right={() => <Switch value={false} />}
          />
        </Card.Content>
      </Card>

      <Card style={cardStyle}>
        <Card.Content>
          <Text variant="titleLarge" style={sectionTitleStyle}>
            About
          </Text>
          
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          
          <Divider />
          
          <List.Item
            title="Weather Data"
            description="Powered by OpenWeatherMap"
            left={(props) => <List.Icon {...props} icon="cloud" />}
          />
        </Card.Content>
      </Card>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          setSnackbarVisible(false);
          setError(null);
        }}
        duration={2000}
      >
        {error || `Theme changed to ${themeMode}`}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  themeOptions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
    minWidth: 60,
    alignItems: 'center',
  },
  themeOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectedTheme: {
    borderWidth: 1,
  },
  selectedThemeText: {
    fontWeight: 'bold',
  },
  disabledOption: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
});
