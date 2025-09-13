import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ErrorBoundary } from '../src/components';
import { ThemeProvider, useThemeContext } from '../src/contexts/ThemeContext';
import { DatabaseProvider } from '../src/contexts/DatabaseContext';
import { UnitsProvider } from '../src/contexts/UnitsContext';
import { DisplayPreferencesProvider } from '../src/contexts/DisplayPreferencesContext';
import { AccessibilityProvider } from '../src/contexts/AccessibilityContext';
import { WeatherMapsProvider } from '../src/contexts/WeatherMapsContext';
import { store } from '../src/store';
import { imageOptimizer } from '../src/utils/imageOptimizer';
import { performanceMonitor } from '../src/utils/performanceMonitor';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { effectiveTheme, theme } = useThemeContext();

  // Initialize performance optimizations and hide splash screen
  useEffect(() => {
    async function prepare() {
      try {
        // Skip image preloading for now due to require() issues
        // imageOptimizer.preloadWeatherIcons().catch((error) => {
        //   console.warn('Failed to preload weather icons:', error);
        // });
        
        // Start performance monitoring
        performanceMonitor.startTiming('app_initialization');
        
        // Pre-load fonts, make any API calls you need to do here
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate loading time
        
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        await SplashScreen.hideAsync();
        performanceMonitor.endTiming('app_initialization');
      }
    }

    prepare();
  }, []);

  return (
    <PaperProvider theme={theme} key={effectiveTheme}>
      <AccessibilityProvider>
        <UnitsProvider>
          <DisplayPreferencesProvider>
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
          </DisplayPreferencesProvider>
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
