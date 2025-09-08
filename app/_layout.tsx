import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from '../src/components';
import { ThemeProvider, useThemeContext } from '../src/contexts/ThemeContext';
import { store } from '../src/store';
import { databaseConnection } from '../src/database';

function AppContent() {
  const { effectiveTheme, theme } = useThemeContext();

  return (
    <PaperProvider theme={theme} key={effectiveTheme}>
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
    </PaperProvider>
  );
}

function RootLayout() {
  useEffect(() => {
    // Initialize database
    const initDatabase = async () => {
      try {
        await databaseConnection.initialize();
        // Database initialized successfully
      } catch (error) {
        console.error('Database initialization failed:', error);
      }
    };
    
    initDatabase();
  }, []);

  return (
    <ReduxProvider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ReduxProvider>
  );
}

export default RootLayout;
