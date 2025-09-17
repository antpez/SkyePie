import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ErrorBoundary } from '../src/components';
import { ThemeLoadingScreen } from '../src/components/common/ThemeLoadingScreen';
import { ThemeProvider, useThemeContext } from '../src/contexts/ThemeContext';
import { useAppInitialization } from '../src/hooks/useAppInitialization';
import { appInitializer } from '../src/utils/appInitializer';
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
  const { effectiveTheme, theme, isInitialized } = useThemeContext();
  const appInitState = useAppInitialization();

  // Initialize app and hide splash screen
  useEffect(() => {
    let isMounted = true;
    
    async function prepare() {
      try {
        // Start performance monitoring
        performanceMonitor.startTiming('app_initialization');
        
        // Initialize app with proper coordination
        await appInitializer.initialize();
        
        // Hide splash screen after initialization
        if (isMounted) {
          await SplashScreen.hideAsync();
          performanceMonitor.endTiming('app_initialization');
        }
        
      } catch (e) {
        console.warn('App initialization error:', e);
        // Ensure splash screen is hidden even on error
        if (isMounted) {
          await SplashScreen.hideAsync();
          performanceMonitor.endTiming('app_initialization');
        }
      }
    }

    prepare();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ThemeLoadingScreen>
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
    </ThemeLoadingScreen>
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
