import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ErrorBoundary } from '../src/components';
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
  const [isAppReady, setIsAppReady] = useState(false);

  // Initialize app and hide splash screen
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    async function prepare() {
      try {
        // Start performance monitoring
        performanceMonitor.startTiming('app_initialization');
        
        // Initialize app with proper coordination
        await appInitializer.initialize();
        
        // Wait for theme to be initialized
        if (isInitialized) {
          // Hide splash screen after initialization
          if (isMounted) {
            await SplashScreen.hideAsync();
            setIsAppReady(true);
            performanceMonitor.endTiming('app_initialization');
          }
        }
        
      } catch (e) {
        console.warn('App initialization error:', e);
        // Ensure splash screen is hidden even on error
        if (isMounted) {
          await SplashScreen.hideAsync();
          setIsAppReady(true);
          performanceMonitor.endTiming('app_initialization');
        }
      }
    }

    // Set a timeout to force hide splash screen after 5 seconds
    timeoutId = setTimeout(async () => {
      if (isMounted && !isAppReady) {
        console.warn('⚠️ Splash screen timeout reached, forcing app to show');
        await SplashScreen.hideAsync();
        setIsAppReady(true);
      }
    }, 5000);

    prepare();
    
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isInitialized, isAppReady]);

  // Show splash screen until app is ready
  if (!isAppReady) {
    return null; // Splash screen is handled by Expo
  }

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
