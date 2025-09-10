import React from 'react';
import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from '../src/components';
import { ThemeProvider, useThemeContext } from '../src/contexts/ThemeContext';
import { DatabaseProvider } from '../src/contexts/DatabaseContext';
import { UnitsProvider } from '../src/contexts/UnitsContext';
import { AccessibilityProvider } from '../src/contexts/AccessibilityContext';
import { WeatherMapsProvider } from '../src/contexts/WeatherMapsContext';
import { store } from '../src/store';

function AppContent() {
  const { effectiveTheme, theme } = useThemeContext();

  return (
    <PaperProvider theme={theme} key={effectiveTheme}>
      <AccessibilityProvider>
        <UnitsProvider>
          <WeatherMapsProvider>
            <ErrorBoundary>
              <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
              <Stack>
          <Stack.Screen 
            name="(tabs)" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="permissions" 
            options={{ 
              title: 'Location Permission',
              presentation: 'modal' 
            }} 
          />
          <Stack.Screen 
            name="+not-found" 
            options={{ title: 'Not Found' }} 
          />
        </Stack>
            </ErrorBoundary>
          </WeatherMapsProvider>
        </UnitsProvider>
      </AccessibilityProvider>
    </PaperProvider>
  );
}

function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <DatabaseProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </DatabaseProvider>
    </ReduxProvider>
  );
}

export default RootLayout;
