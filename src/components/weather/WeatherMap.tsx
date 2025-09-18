import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useAccessibilityContext } from '@/contexts/AccessibilityContext';
import { WeatherMapLayer, WeatherMapType, WEATHER_MAP_LEGENDS, DEFAULT_WEATHER_MAP_LAYERS } from '@/types/weatherMaps';
import { typography } from '@/styles/typography';

const { height: screenHeight } = Dimensions.get('window');

interface WeatherMapProps {
  center: {
    lat: number;
    lon: number;
  };
  zoom?: number;
  layers?: WeatherMapLayer[];
  onMapClick?: (lat: number, lng: number) => void;
  onLayerToggle?: (layerName: string, visible: boolean) => void;
  showLegend?: boolean;
  apiKey?: string;
}

const WeatherMap: React.FC<WeatherMapProps> = ({
  center,
  zoom = 8,
  layers = [],
  onMapClick,
  onLayerToggle,
  showLegend = true,
  apiKey
}) => {
  const { theme } = useThemeContext();
  const { getFontSize } = useAccessibilityContext();
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapKey, setMapKey] = useState(0);
  const [isLegendVisible, setIsLegendVisible] = useState(false);
  const [showLayerModal, setShowLayerModal] = useState(false);
  const [localLayers, setLocalLayers] = useState<WeatherMapLayer[]>(layers.length > 0 ? layers : DEFAULT_WEATHER_MAP_LAYERS);
  const webViewRef = useRef<WebView>(null);
  const [lastCenter, setLastCenter] = useState<{lat: number, lon: number} | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);

  // Force refresh when component key changes (new location)
  useEffect(() => {
    setForceRefresh(prev => prev + 1);
  }, [center.lat, center.lon]);

  // Update map when center changes with debouncing
  useEffect(() => {
    if (webViewRef.current && center && !isUpdating) {
      // Check if center actually changed
      const centerChanged = !lastCenter || 
        Math.abs(lastCenter.lat - center.lat) > 0.0001 || 
        Math.abs(lastCenter.lon - center.lon) > 0.0001;
      
      // Check if coordinates changed significantly (more than 1 degree) - force refresh
      const significantChange = !lastCenter || 
        Math.abs(lastCenter.lat - center.lat) > 1 || 
        Math.abs(lastCenter.lon - center.lon) > 1;
      
      if (centerChanged) {
        setIsUpdating(true);
        setLastCenter({ lat: center.lat, lon: center.lon });
        
        if (significantChange) {
          setForceRefresh(prev => prev + 1);
        }
        
        // Add a small delay to ensure WebView is ready
        const timeoutId = setTimeout(() => {
          webViewRef.current?.injectJavaScript(`
            if (window.map && window.map.setView) {
              window.map.setView([${center.lat}, ${center.lon}], ${zoom});
              
              // Update user marker position
              if (window.userMarker) {
                window.userMarker.setLatLng([${center.lat}, ${center.lon}]);
              }
              
              // Notify that map was updated
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'mapUpdated',
                  lat: ${center.lat},
                  lon: ${center.lon}
                }));
              }
            }
          `);
          setIsUpdating(false);
        }, 100);
        
        return () => {
          clearTimeout(timeoutId);
          setIsUpdating(false);
        };
      }
    }
  }, [center.lat, center.lon, zoom, lastCenter, isUpdating]);

  // Handle WebView messages
  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'webViewReady':
          // if (__DEV__) {
          //   console.log('WebView ready message received:', data.message);
          // }
          break;
        case 'mapReady':
          // if (__DEV__) {
          //   console.log('Map ready message received');
          // }
          setIsMapLoading(false);
          // Update map to current center when map is ready
          if (center) {
            setTimeout(() => {
              webViewRef.current?.injectJavaScript(`
                if (window.map && window.map.setView) {
                  window.map.setView([${center.lat}, ${center.lon}], ${zoom});
                  
                  // Update user marker position
                  if (window.userMarker) {
                    window.userMarker.setLatLng([${center.lat}, ${center.lon}]);
                  }
                }
              `);
            }, 200);
          }
          break;
        case 'mapError':
          console.error('Map error message received:', data.error);
          setMapError(data.error);
          setIsMapLoading(false);
          break;
        case 'javascriptError':
          console.error('JavaScript error in WebView:', data.error);
          console.error('Stack trace:', data.stack);
          setMapError(`JavaScript error: ${data.error}`);
          setIsMapLoading(false);
          break;
        case 'mapClick':
          // if (__DEV__) {
          //   console.log('Map click received:', data.lat, data.lng);
          // }
          onMapClick?.(data.lat, data.lng);
          break;
        case 'layerToggle':
          // if (__DEV__) {
          //   console.log('Layer toggle received:', data.layerName, data.visible);
          // }
          onLayerToggle?.(data.layerName, data.visible);
          break;
        case 'mapUpdated':
          // if (__DEV__) {
          //   console.log('Map updated to new location:', data.lat, data.lon);
          // }
          break;
        default:
          // if (__DEV__) {
          //   console.log('Unknown message type:', data.type);
          // }
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  }, [onMapClick, onLayerToggle]);

  // Handle layer toggle
  const handleLayerToggle = useCallback((layerId: string) => {
    setLocalLayers(prevLayers => {
      const updatedLayers = prevLayers.map(layer => 
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      );
      
      // Toggle layer in WebView
      const toggledLayer = updatedLayers.find(layer => layer.id === layerId);
      if (toggledLayer && webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          window.toggleLayer('${toggledLayer.name}', ${toggledLayer.visible});
        `);
      }
      
      return updatedLayers;
    });
  }, []);


  // Get visible legends
  const visibleLegends = useMemo(() => {
    return localLayers
      .filter(layer => layer.visible)
      .map(layer => {
        // Map layer types to legend types
        let legendType = layer.type;
        switch (layer.type) {
          case 'clouds':
            legendType = 'clouds';
            break;
          case 'rain_accumulation':
          case 'precipitation_intensity':
            legendType = 'precipitation';
            break;
          case 'wind_speed':
          case 'wind_arrows':
            legendType = 'wind';
            break;
          case 'air_temperature':
            legendType = 'temperature';
            break;
          case 'snow_accumulation':
          case 'snow_depth':
            legendType = 'precipitation';
            break;
        }
        
        const legend = WEATHER_MAP_LEGENDS[legendType as WeatherMapType];
        return { layer, legend };
      })
      .filter(({ legend }) => legend);
  }, [localLayers]);

  // Generate map HTML with all layers
  const mapHtml = useMemo(() => {
    const centerLat = center.lat;
    const centerLon = center.lon;
    const mapZoom = zoom;
    const apiKeyValue = apiKey || 'demo';
    
    
    // Generate layer URLs for visible layers
    const visibleLayers = localLayers.filter(layer => layer.visible);
    const layerUrls = visibleLayers.map(layer => {
      const layerType = layer.type;
      let url = '';
      
      switch (layerType) {
        case 'precipitation_intensity':
          url = `https://tile.openweathermap.org/map/precipitation/{z}/{x}/{y}.png?appid=${apiKeyValue}`;
          break;
        case 'clouds':
          url = `https://tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png?appid=${apiKeyValue}`;
          break;
        case 'wind_speed':
        case 'wind_arrows':
          url = `https://tile.openweathermap.org/map/wind/{z}/{x}/{y}.png?appid=${apiKeyValue}`;
          break;
        case 'air_temperature':
          url = `https://tile.openweathermap.org/map/temp/{z}/{x}/{y}.png?appid=${apiKeyValue}`;
          break;
        default:
          url = `https://tile.openweathermap.org/map/precipitation/{z}/{x}/{y}.png?appid=${apiKeyValue}`;
      }
      
      return {
        name: layer.name,
        url,
        opacity: 1.0,
        zIndex: layer.zIndex
      };
    });
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weather Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          body { margin: 0; padding: 0; height: 100vh; overflow: hidden; }
          #map { width: 100%; height: 100vh; min-height: 300px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'webViewReady',
              message: 'WebView JavaScript is working'
            }));
          }
          
          setTimeout(() => {
            try {
              const map = L.map('map').setView([${centerLat}, ${centerLon}], ${mapZoom});
              
              // Add base map
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
              }).addTo(map);
              
              // Add weather layers
              const weatherLayers = {};
              ${layerUrls.map((layer, index) => `
                weatherLayers['${layer.name}'] = L.tileLayer('${layer.url}', {
                  attribution: '© OpenWeatherMap',
                  opacity: 1.0,
                  zIndex: ${layer.zIndex},
                  maxZoom: 18
                });
                weatherLayers['${layer.name}'].addTo(map);
              `).join('')}
              
              // Add user location marker
              const userLocationIcon = L.divIcon({
                className: 'user-location-marker',
                html: '<div style="background-color: #2196F3; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              });
              
              window.userMarker = L.marker([${centerLat}, ${centerLon}], {
                icon: userLocationIcon
              }).addTo(map);
              
              // Add map click handler
              map.on('click', function(e) {
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'mapClick',
                    lat: e.latlng.lat,
                    lng: e.latlng.lng
                  }));
                }
              });
              
              
              // Global function for layer toggle
              window.toggleLayer = function(layerName, visible) {
                if (weatherLayers[layerName]) {
                  if (visible) {
                    weatherLayers[layerName].addTo(map);
                  } else {
                    weatherLayers[layerName].remove();
                  }
                } else {
                  console.error('Layer not found for toggle:', layerName);
                }
              };
              
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'mapReady',
                  message: 'Map initialization complete'
                }));
              }
            } catch (error) {
              console.error('Map initialization error:', error);
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'mapError',
                  error: error.message
                }));
              }
            }
          }, 100);
        </script>
      </body>
      </html>
    `;
  }, [center, zoom, apiKey, localLayers]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    mapHeaderContainer: {
      // Margin handled by parent weatherMapContainer
    },
    mapTitle: {
      marginBottom: 16,
      ...typography.titleLarge,
    },
    webView: {
      height: 300, // Set explicit height for the map
      // Margin handled by parent weatherMapContainer
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    loadingText: {
      marginTop: 16,
      textAlign: 'center',
    },
    loadingSubtext: {
      marginTop: 8,
      textAlign: 'center',
    },
    errorContainer: {
      padding: 20,
      alignItems: 'center',
    },
    errorText: {
      textAlign: 'center',
      marginBottom: 16,
    },
    retryButton: {
      marginTop: 8,
    },
    legendContainer: {
      marginTop: 16,
      // Margin handled by parent weatherMapContainer
      // Removed background, border, and padding to eliminate white box
    },
    legendTitle: {
      ...typography.titleMedium,
      marginBottom: 12,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    legendColor: {
      width: 20,
      height: 20,
      borderRadius: 10,
      marginRight: 12,
    },
    legendText: {
      flex: 1,
      ...typography.bodySmall,
      color: theme.colors.onSurface,
    },
    layerButton: {
      position: 'absolute',
      top: -10, // Move above the Map title
      right: 0, // Position at the top right
      zIndex: 1000,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      paddingBottom: 40,
      maxHeight: screenHeight * 0.67,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    closeButton: {
      margin: 0,
    },
    layerList: {
      paddingHorizontal: 20,
    },
    layerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    layerIcon: {
      marginRight: 12,
      fontSize: 20,
    },
    layerInfo: {
      flex: 1,
    },
    layerName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    layerDescription: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    layerControls: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    toggleButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    toggleButtonOn: {
      backgroundColor: theme.colors.primary,
    },
    toggleButtonOff: {
      backgroundColor: theme.colors.outline,
    },
    toggleButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 12,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.mapHeaderContainer}>
        <Text 
          variant="titleLarge" 
          style={[
            styles.mapTitle, 
            { 
              color: theme.colors.onSurface, 
              fontSize: getFontSize(20),
              marginBottom: 16,
              fontWeight: '700'
            }
          ]}
        >
          Map
        </Text>
      </View>

      {mapError ? (
        <View style={styles.errorContainer}>
          <Text 
            variant="bodyMedium" 
            style={[
              styles.errorText, 
              { color: theme.colors.onSurface, fontSize: getFontSize(16) }
            ]}
          >
            {mapError}
          </Text>
          <Button
            mode="outlined"
            onPress={() => {
              setMapError(null);
              setIsMapLoading(true);
              setMapKey(prev => prev + 1);
            }}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          key={`${mapKey}-${forceRefresh}`}
          source={{ html: mapHtml }}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          onLoadStart={() => {
            // if (__DEV__) {
            //   console.log('WebView load started');
            // }
            setIsMapLoading(true);
          }}
          onLoadEnd={() => {
            // if (__DEV__) {
            //   console.log('WebView load ended');
            // }
            setTimeout(() => {
              if (isMapLoading) {
                // if (__DEV__) {
                //   console.log('WebView load timeout - stopping loading indicator');
                // }
                setIsMapLoading(false);
              }
            }, 8000);
          }}
          onLoadProgress={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            // if (__DEV__) {
            //   console.log('WebView load progress:', nativeEvent.progress);
            // }
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
            setMapError('Failed to load weather map. Please check your internet connection.');
            setIsMapLoading(false);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView HTTP error:', nativeEvent);
            setMapError(`HTTP Error: ${nativeEvent.statusCode}`);
            setIsMapLoading(false);
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
      )}

      {isMapLoading && (
        <View style={styles.loadingContainer}>
          <Text 
            variant="bodyLarge" 
            style={[
              styles.loadingText, 
              { color: theme.colors.onSurface, fontSize: getFontSize(16) }
            ]}
          >
            Loading weather map...
          </Text>
          <Text 
            variant="bodyMedium" 
            style={[
              styles.loadingSubtext, 
              { color: theme.colors.onSurfaceVariant, fontSize: getFontSize(14) }
            ]}
          >
            This may take a moment
          </Text>
        </View>
      )}

      {/* Legend */}
      {visibleLegends.length > 0 && (
        <View style={styles.legendContainer}>
          <Text 
            variant="titleLarge" 
            style={[
              styles.legendTitle, 
              { 
                color: theme.colors.onSurface, 
                fontSize: getFontSize(20),
                marginBottom: 16,
                fontWeight: '700'
              }
            ]}
          >
            Legend
          </Text>
          {visibleLegends.map(({ layer, legend }, index) => (
            <View key={layer.id}>
              <Text style={[styles.legendText, { fontWeight: 'bold', marginBottom: 8 }]}>
                {layer.name}
              </Text>
              {legend.colors && legend.colors.map((colorItem, colorIndex) => (
                <View key={colorIndex} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: colorItem.color }]} />
                  <Text style={styles.legendText}>{colorItem.label}</Text>
                </View>
              ))}
              {legend.unit && (
                <Text style={[styles.legendText, { fontSize: 12, color: theme.colors.onSurfaceVariant, marginTop: 4 }]}>
                  Unit: {legend.unit}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Layer Controls Button */}
      <TouchableOpacity
        style={styles.layerButton}
        onPress={() => setShowLayerModal(true)}
        accessibilityLabel="Open layer controls"
        accessibilityHint="Tap to open weather layer controls"
      >
        <IconButton
          icon="layers"
          size={24}
          iconColor={theme.colors.onSurface}
          style={{ backgroundColor: theme.colors.surface }}
        />
      </TouchableOpacity>

      {/* Layer Selection Modal */}
      <Modal
        visible={showLayerModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLayerModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Weather Layers</Text>
              <IconButton
                icon="close"
                size={24}
                iconColor={theme.colors.onSurface}
                onPress={() => setShowLayerModal(false)}
                style={styles.closeButton}
              />
            </View>
            
            <ScrollView style={styles.layerList}>
              {localLayers.map((layer) => (
                <View key={layer.id} style={styles.layerItem}>
                  <Text style={styles.layerIcon}>{layer.icon}</Text>
                  <View style={styles.layerInfo}>
                    <Text style={styles.layerName}>{layer.name}</Text>
                    <Text style={styles.layerDescription}>{layer.description}</Text>
                  </View>
                  <View style={styles.layerControls}>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        layer.visible ? styles.toggleButtonOn : styles.toggleButtonOff
                      ]}
                      onPress={() => handleLayerToggle(layer.id)}
                    >
                      <Text style={styles.toggleButtonText}>
                        {layer.visible ? 'ON' : 'OFF'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WeatherMap;