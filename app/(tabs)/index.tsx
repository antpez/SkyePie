import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, FAB, Snackbar, Button, SegmentedButtons } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { WeatherCard, ForecastRow, HourlyForecast, LoadingSpinner, WeatherAlerts } from '../../src/components';
import { NetworkErrorDisplay } from '../../src/components/common/NetworkErrorDisplay';
import { HealthCard, SkinProtectionCard, WeatherTipsCard } from '../../src/components/health';
import { AIInsightsCard, ClothingRecommendationsCard, ActivityRecommendationsCard } from '../../src/components/ai';
import { useLocation } from '../../src/hooks';
import { useOfflineWeather } from '../../src/hooks/useOfflineWeather';
import { useThemeContext } from '../../src/contexts/ThemeContext';
import { useDatabase } from '../../src/contexts/DatabaseContext';
import { LocationCoordinates } from '../../src/types';
import { APP_CONFIG } from '../../src/config/app';
import { healthService } from '../../src/services/healthService';
import { aiService } from '../../src/services/aiService';
import { gamificationService } from '../../src/services/gamificationService';
import { socialService } from '../../src/services/socialService';
import { travelService } from '../../src/services/travelService';
import { accessibilityService } from '../../src/services/accessibilityService';
import { smartHomeService } from '../../src/services/smartHomeService';
import { visualizationService } from '../../src/services/visualizationService';
import { dataSourcesService } from '../../src/services/dataSourcesService';
import { hyperlocalService } from '../../src/services/hyperlocalService';

export default function WeatherScreen() {
  const { effectiveTheme, theme } = useThemeContext();
  const { isInitialized: dbInitialized, isInitializing: dbInitializing, error: dbError } = useDatabase();
  const { currentLocation, permissionStatus, getCurrentLocation } = useLocation();
  const searchParams = useLocalSearchParams();
  
  // Get API key from config
  const API_KEY = APP_CONFIG.api.openWeatherMap.apiKey;
  
  const { 
    currentWeather, 
    forecast, 
    alerts,
    isLoading, 
    error, 
    networkError,
    isOffline,
    isOnline,
    isSlowConnection,
    fetchCurrentWeather, 
    fetchForecast,
    fetchAlerts,
    refreshWeather,
    clearNetworkError,
    refreshNetworkStatus
  } = useOfflineWeather(API_KEY);

  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(null);
  const [showHourlyForecast, setShowHourlyForecast] = useState(false);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const processedSearchParams = useRef<string>('');

  // Advanced features state
  const [healthData, setHealthData] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [clothingRecommendations, setClothingRecommendations] = useState<any[]>([]);
  const [activityRecommendations, setActivityRecommendations] = useState<any[]>([]);
  const [gamificationData, setGamificationData] = useState<any>(null);
  const [socialData, setSocialData] = useState<any>(null);
  const [travelData, setTravelData] = useState<any>(null);
  const [accessibilityData, setAccessibilityData] = useState<any>(null);
  const [smartHomeData, setSmartHomeData] = useState<any>(null);
  const [visualizationData, setVisualizationData] = useState<any>(null);
  const [dataSourcesData, setDataSourcesData] = useState<any>(null);
  const [hyperlocalData, setHyperlocalData] = useState<any>(null);

  // Memoized values for performance - optimized dependencies
  const locationToUse = useMemo(() => selectedLocation || currentLocation, [selectedLocation, currentLocation]);
  const hasSearchParams = useMemo(() => 
    !!(searchParams.latitude && searchParams.longitude), 
    [searchParams.latitude, searchParams.longitude]
  );
  const searchKey = useMemo(() => 
    hasSearchParams ? `${searchParams.latitude}-${searchParams.longitude}` : '', 
    [hasSearchParams, searchParams.latitude, searchParams.longitude]
  );

  // (Weather map temporarily disabled)

  // Memoized theme styles to prevent re-renders
  const containerStyle = useMemo(() => [
    styles.container, 
    { backgroundColor: theme.colors.background }
  ], [theme.colors.background]);

  const emptyTitleStyle = useMemo(() => [
    styles.emptyTitle, 
    { color: theme.colors.onSurface }
  ], [theme.colors.onSurface]);

  const emptyMessageStyle = useMemo(() => [
    styles.emptyMessage, 
    { color: theme.colors.onSurface }
  ], [theme.colors.onSurface]);

  const loadWeatherData = useCallback(async (location: LocationCoordinates) => {
    try {
      // Use Promise.allSettled to prevent one failure from stopping others
      const results = await Promise.allSettled([
        fetchCurrentWeather(location.latitude, location.longitude),
        fetchForecast(location.latitude, location.longitude),
        fetchAlerts(location.latitude, location.longitude),
      ]);
      
      // Log any failures but don't throw
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const operation = ['current weather', 'forecast', 'alerts'][index];
          console.warn(`Failed to load ${operation}:`, result.reason);
        }
      });
    } catch (err) {
      console.error('Error loading weather data:', err);
      setSnackbarVisible(true);
    }
  }, [fetchCurrentWeather, fetchForecast, fetchAlerts]);

  const loadAdvancedFeatures = useCallback(async (weather: any, forecast: any) => {
    if (!weather || !forecast) return;

    try {
      // Health & Wellness
      const uvIndex = healthService.calculateUVIndex(5); // Simulated UV index
      const airQuality = healthService.generateAirQualityRecommendations(50); // Simulated AQI
      const pollenData = healthService.generatePollenData('spring', weather);
      const healthAlerts = healthService.generateHealthAlerts(weather, uvIndex, airQuality, pollenData);
      const skinProtection = healthService.generateSkinProtection(uvIndex, weather);
      const weatherTips = healthService.generateWeatherHealthTips(weather);
      
      setHealthData({
        uvIndex,
        airQuality,
        pollenData,
        healthAlerts,
        skinProtection,
        weatherTips
      });

      // AI Insights
      const clothingRecs = await aiService.generateClothingRecommendations(weather, forecast);
      const activityRecs = await aiService.generateActivityRecommendations(weather, aiService.getUserPreferences());
      const insights = await aiService.generatePersonalizedInsights(weather, forecast, aiService.getUserPreferences());
      
      setClothingRecommendations(clothingRecs);
      setActivityRecommendations(activityRecs);
      setAiInsights(insights);

      // Gamification
      const userStats = gamificationService.getUserStats();
      const achievements = gamificationService.getAchievements();
      setGamificationData({ userStats, achievements });

      // Social Features
      const recentPhotos = socialService.getRecentPhotos(5);
      const recentReports = socialService.getRecentReports(5);
      const challenges = socialService.getActiveChallenges();
      setSocialData({ recentPhotos, recentReports, challenges });

      // Travel Intelligence
      const destinations = travelService.getDestinations();
      const recommendations = travelService.getTravelRecommendations({});
      setTravelData({ destinations, recommendations });

      // Accessibility
      const voiceReport = accessibilityService.generateVoiceWeatherReport(weather, 'Current Location');
      const accessibilitySettings = accessibilityService.getAccessibilitySettings();
      setAccessibilityData({ voiceReport, settings: accessibilitySettings });

      // Smart Home
      const thermostatControl = smartHomeService.adjustThermostatForWeather(weather, forecast);
      const gardenAlerts = smartHomeService.generateGardenCareAlerts(weather, forecast);
      const equipmentAlerts = smartHomeService.generateOutdoorEquipmentAlerts(weather, forecast);
      const energyOptimization = smartHomeService.optimizeEnergyUsage(weather, forecast);
      setSmartHomeData({ thermostatControl, gardenAlerts, equipmentAlerts, energyOptimization });

      // Visualization
      const temperatureAnimation = visualizationService.generateTemperatureAnimation(forecast);
      const precipitationAnimation = visualizationService.generatePrecipitationAnimation(forecast);
      const windAnimation = visualizationService.generateWindAnimation(forecast);
      const soundscape = visualizationService.generateWeatherSoundscape(weather);
      setVisualizationData({ temperatureAnimation, precipitationAnimation, windAnimation, soundscape });

      // Data Sources
      const satelliteImages = dataSourcesService.getSatelliteImages('visible', 3);
      const weatherPatterns = dataSourcesService.detectWeatherPatterns(weather, forecast);
      const seasonalTrends = dataSourcesService.analyzeSeasonalTrends('Current Location', new Date().getFullYear());
      const weatherInsights = dataSourcesService.generateWeatherInsights(weather, forecast);
      setDataSourcesData({ satelliteImages, weatherPatterns, seasonalTrends, weatherInsights });

      // Hyperlocal
      const neighborhoodWeather = hyperlocalService.getNeighborhoodWeather(weather.coord.lat, weather.coord.lon);
      const nearbyReports = hyperlocalService.getNearbyReports(weather.coord.lat, weather.coord.lon);
      const crowdsourcedData = hyperlocalService.getCrowdsourcedData();
      setHyperlocalData({ neighborhoodWeather, nearbyReports, crowdsourcedData });

    } catch (err) {
      console.error('Error loading advanced features:', err);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!locationToUse) return;
    
    setRefreshing(true);
    try {
      await refreshWeather(locationToUse.latitude, locationToUse.longitude);
      // Load advanced features after weather data is refreshed
      if (currentWeather && forecast) {
        await loadAdvancedFeatures(currentWeather, forecast);
      }
    } catch (err) {
      console.error('Error refreshing weather:', err);
      setSnackbarVisible(true);
    } finally {
      setRefreshing(false);
    }
  }, [locationToUse, refreshWeather, currentWeather, forecast, loadAdvancedFeatures]);

  const handleLocationPress = useCallback(async () => {
    try {
      const location = await getCurrentLocation();
      if (location) {
        setSelectedLocation(null); // Clear selected location
        await loadWeatherData(location);
      }
    } catch (err) {
      console.error('Error getting current location:', err);
      setSnackbarVisible(true);
    }
  }, [getCurrentLocation, loadWeatherData]);

  // Initialize app and request location
  useEffect(() => {
    const initApp = async () => {
      // Wait for database initialization
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsInitializing(false);
      
      // Automatically request location when app starts
      try {
        const location = await getCurrentLocation();
        if (location) {
          await loadWeatherData(location);
        }
      } catch (err) {
        // Use a fallback location (London) for testing
        const fallbackLocation: LocationCoordinates = {
          latitude: 51.5074,
          longitude: -0.1278,
        };
        await loadWeatherData(fallbackLocation);
      }
    };
    
    initApp();
  }, []); // Empty dependency array for initialization

  // Handle search params changes - optimized approach
  useEffect(() => {
    const processSearchParams = async () => {
      if (hasSearchParams && !isInitializing) {
        // Only process if we haven't processed this search params before
        if (processedSearchParams.current !== searchKey) {
          processedSearchParams.current = searchKey;
          
          try {
            const lat = parseFloat(searchParams.latitude as string);
            const lon = parseFloat(searchParams.longitude as string);
            
            if (!isNaN(lat) && !isNaN(lon)) {
              const location: LocationCoordinates = {
                latitude: lat,
                longitude: lon,
              };
              setSelectedLocation(location);
              await loadWeatherData(location);
            }
          } catch (err) {
            console.error('Error loading search location:', err);
          }
        }
      }
    };
    
    processSearchParams();
  }, [hasSearchParams, searchKey, isInitializing, loadWeatherData]);

  // Load weather data when location is available (for manual requests)
  useEffect(() => {
    const loadCurrentLocationWeather = async () => {
      if (currentLocation && !isInitializing && !selectedLocation) {
        await loadWeatherData(currentLocation);
      }
    };
    
    loadCurrentLocationWeather();
  }, [currentLocation, isInitializing, selectedLocation]);

  // Load advanced features when weather data is available
  useEffect(() => {
    if (currentWeather && forecast && !isInitializing) {
      loadAdvancedFeatures(currentWeather, forecast);
    }
  }, [currentWeather, forecast, isInitializing, loadAdvancedFeatures]);


  // Show database initialization loading
  if (dbInitializing) {
    return (
      <View style={containerStyle} key={`db-initializing-${effectiveTheme}`}>
        <LoadingSpinner message="Initializing app..." />
      </View>
    );
  }

  // Show database error
  if (dbError) {
    return (
      <View style={containerStyle} key={`db-error-${effectiveTheme}`}>
        <View style={styles.permissionContainer}>
          <Text variant="headlineSmall" style={[styles.permissionTitle, { color: theme.colors.onSurface }]}>
            Database Error
          </Text>
          <Text variant="bodyLarge" style={[styles.permissionMessage, { color: theme.colors.onSurface }]}>
            {dbError}
          </Text>
          <FAB
            icon="refresh"
            label="Retry"
            onPress={() => {
              // Force app restart by reloading the current screen
              const { router } = require('expo-router');
              router.replace('/(tabs)/');
            }}
            style={styles.fab}
          />
        </View>
      </View>
    );
  }

  // Show permission screen if location permission is not granted or no weather data
  if ((permissionStatus.status === 'denied' || permissionStatus.status === 'undetermined') && !currentWeather) {
    return (
      <View style={containerStyle} key={`permission-${effectiveTheme}`}>
        <View style={styles.permissionContainer}>
          <Text variant="headlineSmall" style={[styles.permissionTitle, { color: theme.colors.onSurface }]}>
            Location Access Required
          </Text>
          <Text variant="bodyLarge" style={[styles.permissionMessage, { color: theme.colors.onSurface }]}>
            Please enable location access to get weather for your current location.
          </Text>
          <Text variant="bodyMedium" style={[styles.permissionSubtext, { color: theme.colors.onSurfaceVariant }]}>
            For iOS Simulator: Go to Device → Location → Custom Location and enter coordinates
          </Text>
          <FAB
            icon="map-marker"
            label="Enable Location"
            onPress={handleLocationPress}
            style={styles.fab}
          />
        </View>
      </View>
    );
  }

  if (isInitializing) {
    return (
      <View style={containerStyle} key={`initializing-${effectiveTheme}`}>
        <LoadingSpinner message="Getting your location..." />
      </View>
    );
  }

  if (isLoading && !currentWeather) {
    return (
      <View style={containerStyle} key={`loading-${effectiveTheme}`}>
        <LoadingSpinner message="Loading weather data..." />
      </View>
    );
  }

  if (error && !currentWeather) {
    return (
      <View style={containerStyle} key={`error-${effectiveTheme}`}>
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall" style={[styles.errorTitle, { color: theme.colors.onSurface }]}>
            Unable to Load Weather
          </Text>
          <Text variant="bodyLarge" style={[styles.errorMessage, { color: theme.colors.onSurface }]}>
            {error}
          </Text>
          <FAB
            icon="refresh"
            label="Try Again"
            onPress={handleLocationPress}
            style={styles.fab}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={containerStyle} key={`weather-${effectiveTheme}`}>
      {selectedLocation && searchParams.name && (
        <View style={[styles.locationHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline }]}>
          <Text variant="titleMedium" style={[styles.locationTitle, { color: theme.colors.onSurface }]}>
            {searchParams.name}
            {searchParams.state && `, ${searchParams.state}`}
            {searchParams.country && `, ${searchParams.country}`}
          </Text>
        </View>
      )}

      {isOffline && (
        <View style={[styles.offlineIndicator, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="bodySmall" style={[styles.offlineText, { color: theme.colors.onSurfaceVariant }]}>
            📡 Showing cached data (offline)
          </Text>
        </View>
      )}

      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {currentWeather && (
          <WeatherCard
            key={`weather-${effectiveTheme}`}
            weather={currentWeather}
            showDetails={true}
          />
        )}

        {alerts && alerts.length > 0 && (
          <WeatherAlerts
            key={`alerts-${effectiveTheme}`}
            alerts={alerts}
          />
        )}

        {networkError && (
          <NetworkErrorDisplay
            key={`network-error-${effectiveTheme}`}
            error={networkError}
            onRetry={async () => {
              clearNetworkError();
              if (locationToUse) {
                await loadWeatherData(locationToUse);
              }
            }}
            onDismiss={clearNetworkError}
          />
        )}

        {/* Weather Map temporarily unavailable (requires paid subscription) */}

        {forecast && (
          <View key={`forecast-container-${effectiveTheme}`}>
            <View style={styles.forecastToggleContainer}>
              <SegmentedButtons
                value={showHourlyForecast ? 'hourly' : 'daily'}
                onValueChange={(value) => setShowHourlyForecast(value === 'hourly')}
                buttons={[
                  {
                    value: 'daily',
                    label: 'Daily',
                    icon: 'calendar-today',
                  },
                  {
                    value: 'hourly',
                    label: 'Hourly',
                    icon: 'clock-outline',
                  },
                ]}
                style={[styles.segmentedButtons, { backgroundColor: theme.colors.surfaceVariant }]}
              />
            </View>
            
            {showHourlyForecast ? (
              <HourlyForecast
                key={`hourly-forecast-${effectiveTheme}`}
                forecast={forecast.list}
              />
            ) : (
              <ForecastRow
                key={`daily-forecast-${effectiveTheme}`}
                forecast={forecast.list}
              />
            )}
          </View>
        )}

        {/* Advanced Features Toggle */}
        <View style={styles.advancedFeaturesToggle}>
          <Button
            mode="outlined"
            onPress={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
            icon={showAdvancedFeatures ? "chevron-up" : "chevron-down"}
            style={styles.toggleButton}
          >
            {showAdvancedFeatures ? 'Hide Advanced Features' : 'Show Advanced Features'}
          </Button>
        </View>

        {/* Advanced Features */}
        {showAdvancedFeatures && (
          <>
            {/* Health & Wellness */}
            {healthData && (
              <>
                <HealthCard
                  uvIndex={healthData.uvIndex}
                  airQuality={healthData.airQuality}
                  pollenData={healthData.pollenData}
                  healthAlerts={healthData.healthAlerts}
                />
                <SkinProtectionCard skinProtection={healthData.skinProtection} />
                <WeatherTipsCard tips={healthData.weatherTips} />
              </>
            )}

            {/* AI Insights */}
            {aiInsights.length > 0 && (
              <AIInsightsCard insights={aiInsights} />
            )}
            {clothingRecommendations.length > 0 && (
              <ClothingRecommendationsCard recommendations={clothingRecommendations} />
            )}
            {activityRecommendations.length > 0 && (
              <ActivityRecommendationsCard recommendations={activityRecommendations} />
            )}

            {/* Gamification */}
            {gamificationData && (
              <View style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
                <Text variant="titleLarge" style={[styles.featureTitle, { color: theme.colors.onSurface }]}>
                  🎮 Gamification
                </Text>
                <Text variant="bodyMedium" style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Level: {gamificationData.userStats.level} | Points: {gamificationData.userStats.totalPoints}
                </Text>
                <Text variant="bodySmall" style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Achievements: {gamificationData.achievements.filter((a: any) => a.isUnlocked).length}/{gamificationData.achievements.length}
                </Text>
              </View>
            )}

            {/* Social Features */}
            {socialData && (
              <View style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
                <Text variant="titleLarge" style={[styles.featureTitle, { color: theme.colors.onSurface }]}>
                  📸 Social Features
                </Text>
                <Text variant="bodyMedium" style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Recent Photos: {socialData.recentPhotos.length} | Reports: {socialData.recentReports.length}
                </Text>
                <Text variant="bodySmall" style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Active Challenges: {socialData.challenges.length}
                </Text>
              </View>
            )}

            {/* Travel Intelligence */}
            {travelData && (
              <View style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
                <Text variant="titleLarge" style={[styles.featureTitle, { color: theme.colors.onSurface }]}>
                  ✈️ Travel Intelligence
                </Text>
                <Text variant="bodyMedium" style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Destinations: {travelData.destinations.length} | Recommendations: {travelData.recommendations.length}
                </Text>
              </View>
            )}

            {/* Accessibility */}
            {accessibilityData && (
              <View style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
                <Text variant="titleLarge" style={[styles.featureTitle, { color: theme.colors.onSurface }]}>
                  ♿ Accessibility
                </Text>
                <Text variant="bodyMedium" style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Voice Reports: {accessibilityData.settings.voiceReports.enabled ? 'Enabled' : 'Disabled'}
                </Text>
                <Text variant="bodySmall" style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Haptic Alerts: {accessibilityData.settings.hapticAlerts.enabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            )}

            {/* Smart Home */}
            {smartHomeData && (
              <View style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
                <Text variant="titleLarge" style={[styles.featureTitle, { color: theme.colors.onSurface }]}>
                  🏠 Smart Home
                </Text>
                <Text variant="bodyMedium" style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Thermostat: {smartHomeData.thermostatControl ? 'Connected' : 'Disconnected'}
                </Text>
                <Text variant="bodySmall" style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Garden Alerts: {smartHomeData.gardenAlerts.length} | Equipment Alerts: {smartHomeData.equipmentAlerts.length}
                </Text>
              </View>
            )}

            {/* Visualization */}
            {visualizationData && (
              <View style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
                <Text variant="titleLarge" style={[styles.featureTitle, { color: theme.colors.onSurface }]}>
                  🎨 Advanced Visualization
                </Text>
                <Text variant="bodyMedium" style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Animations: Temperature, Precipitation, Wind
                </Text>
                <Text variant="bodySmall" style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Soundscape: {visualizationData.soundscape.name}
                </Text>
              </View>
            )}

            {/* Data Sources */}
            {dataSourcesData && (
              <View style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
                <Text variant="titleLarge" style={[styles.featureTitle, { color: theme.colors.onSurface }]}>
                  📡 Data Sources
                </Text>
                <Text variant="bodyMedium" style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Satellite Images: {dataSourcesData.satelliteImages.length} | Weather Patterns: {dataSourcesData.weatherPatterns.length}
                </Text>
                <Text variant="bodySmall" style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Insights: {dataSourcesData.weatherInsights.length}
                </Text>
              </View>
            )}

            {/* Hyperlocal */}
            {hyperlocalData && (
              <View style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
                <Text variant="titleLarge" style={[styles.featureTitle, { color: theme.colors.onSurface }]}>
                  🌍 Hyperlocal Weather
                </Text>
                <Text variant="bodyMedium" style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Neighborhood Reports: {hyperlocalData.nearbyReports.length}
                </Text>
                <Text variant="bodySmall" style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Crowdsourced Data: {hyperlocalData.crowdsourcedData.length}
                </Text>
              </View>
            )}
          </>
        )}

        {!currentWeather && !isLoading && (
          <View style={styles.emptyContainer}>
            <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
              No Weather Data
            </Text>
            <Text variant="bodyLarge" style={[styles.emptyMessage, { color: theme.colors.onSurface }]}>
              Tap the location button to get weather for your current location.
            </Text>
          </View>
        )}
      </ScrollView>

      <FAB
        icon="map-marker"
        label="Current Location"
        onPress={handleLocationPress}
        style={styles.fab}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
      >
        {error || 'An error occurred. Please try again.'}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  locationHeader: {
    padding: 16,
    borderBottomWidth: 1,
  },
  locationTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  permissionMessage: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  permissionSubtext: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  emptyMessage: {
    textAlign: 'center',
    lineHeight: 24,
  },
  offlineIndicator: {
    padding: 8,
    alignItems: 'center',
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  forecastToggleContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  segmentedButtons: {
    borderRadius: 8,
  },
  advancedFeaturesToggle: {
    margin: 16,
    alignItems: 'center',
  },
  toggleButton: {
    borderRadius: 8,
  },
  featureCard: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  featureTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  featureDescription: {
    marginBottom: 4,
    lineHeight: 20,
  },
});
