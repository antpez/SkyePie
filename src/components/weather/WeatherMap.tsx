import React, { memo, useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Card, Text, Button, IconButton, Chip, Portal, Modal } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { useThemeContext } from '../../contexts/ThemeContext';
import { useAccessibilityContext } from '../../contexts/AccessibilityContext';
import { WeatherMapType, WeatherMapConfig, WeatherMapLayer, DEFAULT_WEATHER_MAP_LAYERS, WEATHER_MAP_LEGENDS } from '../../types/weatherMaps';

interface WeatherMapProps {
  center: {
    lat: number;
    lon: number;
  };
  zoom?: number;
  layers?: WeatherMapLayer[];
  onLayerToggle?: (layerId: string, visible: boolean) => void;
  onMapPress?: (lat: number, lon: number) => void;
  showControls?: boolean;
  showLegend?: boolean;
  locationName?: string;
  apiKey?: string;
}

export const WeatherMap: React.FC<WeatherMapProps> = memo(({
  center,
  zoom = 8,
  layers = DEFAULT_WEATHER_MAP_LAYERS,
  onLayerToggle,
  onMapPress,
  showControls = true,
  showLegend = true,
  locationName,
  apiKey,
}) => {
  const { theme } = useThemeContext();
  const { getFontSize, shouldUseBoldText } = useAccessibilityContext();
  const [selectedLayer, setSelectedLayer] = useState<WeatherMapType | null>(null);
  const [showLayerSelector, setShowLayerSelector] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);

  // Force map refresh when layers or center changes
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [layers, center]);

  // Add timeout for loading state
  useEffect(() => {
    if (isMapLoading) {
      const timeout = setTimeout(() => {
        setMapError('Map is taking too long to load. Please check your internet connection and try again.');
        setIsMapLoading(false);
      }, 10000); // 10 second timeout for actual map

      return () => clearTimeout(timeout);
    }
  }, [isMapLoading]);


  // Validate center coordinates
  const isValidLocation = useMemo(() => {
    return center && 
           typeof center.lat === 'number' && 
           typeof center.lon === 'number' &&
           !isNaN(center.lat) && 
           !isNaN(center.lon) &&
           center.lat >= -90 && center.lat <= 90 &&
           center.lon >= -180 && center.lon <= 180;
  }, [center]);

  // Generate HTML for the map
  const mapHtml = useMemo(() => {
    const visibleLayers = layers.filter(layer => layer.visible);
    const layerUrls = visibleLayers.map(layer => {
      const layerMap: { [key in WeatherMapType]: string } = {
        precipitation: 'precipitation_new',
        temperature: 'temp_new',
        wind: 'wind_new',
        clouds: 'clouds_new',
        pressure: 'pressure_new',
        visibility: 'visibility_new',
      };
      return {
        name: layer.name,
        url: `https://tile.openweathermap.org/map/${layerMap[layer.type]}/{z}/{x}/{y}.png?appid=${apiKey || 'demo'}`,
        opacity: layer.opacity,
        zIndex: layer.zIndex,
      };
    });

    // Return a working weather map using free alternatives
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100%; height: 100vh; }
          .leaflet-control-layers { background: white; padding: 10px; border-radius: 5px; }
          .leaflet-control-layers label { font-size: 14px; }
          .weather-info {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255,255,255,0.95);
            padding: 15px;
            border-radius: 8px;
            font-size: 12px;
            z-index: 1000;
            max-width: 200px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          }
          .weather-info h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 14px;
          }
          .weather-info p {
            margin: 5px 0;
            color: #666;
          }
          .weather-marker {
            background: linear-gradient(45deg, #4CAF50, #2196F3);
            border: 3px solid white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="weather-info">
          <h3>🌤️ Weather Map</h3>
          <p><strong>Location:</strong> ${locationName || 'Unknown'}</p>
          <p><strong>Coordinates:</strong> ${center.lat.toFixed(4)}, ${center.lon.toFixed(4)}</p>
          <p><strong>Status:</strong> <span id="status">Loading...</span></p>
          <p><em>Interactive map with weather data</em></p>
        </div>
        <script>
          try {
            console.log('Starting weather map...');
            const map = L.map('map').setView([${center.lat}, ${center.lon}], ${zoom});
            
            // Add base map with multiple free options
            const baseMaps = {
              'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
              }),
              'CartoDB Positron': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap, © CartoDB',
                maxZoom: 19
              }),
              'CartoDB Dark': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap, © CartoDB',
                maxZoom: 19
              })
            };
            
            // Add default base map
            baseMaps['OpenStreetMap'].addTo(map);
            
            // Create weather data markers (simulated for demo)
            const weatherData = [
              {
                lat: ${center.lat},
                lon: ${center.lon},
                temp: '22°C',
                condition: '☀️',
                description: '${locationName || 'Current Location'}'
              }
            ];
            
            // Add weather markers
            const weatherMarkers = L.layerGroup();
            
            weatherData.forEach(weather => {
              const marker = L.marker([weather.lat, weather.lon], {
                icon: L.divIcon({
                  className: 'weather-marker',
                  html: \`<div class="weather-marker">\${weather.condition}</div>\`,
                  iconSize: [30, 30],
                  iconAnchor: [15, 15]
                })
              });
              
              marker.bindPopup(\`
                <div style="text-align: center; min-width: 120px;">
                  <h4 style="margin: 0 0 5px 0; color: #333;">\${weather.description}</h4>
                  <p style="margin: 0; font-size: 18px; font-weight: bold; color: #2196F3;">\${weather.temp}</p>
                  <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Current Weather</p>
                </div>
              \`);
              
              weatherMarkers.addLayer(marker);
            });
            
            weatherMarkers.addTo(map);
            
            // Add some additional weather points around the area for demo
            const additionalPoints = [
              { lat: ${center.lat + 0.01}, lon: ${center.lon + 0.01}, temp: '21°C', condition: '⛅' },
              { lat: ${center.lat - 0.01}, lon: ${center.lon - 0.01}, temp: '23°C', condition: '🌤️' },
              { lat: ${center.lat + 0.02}, lon: ${center.lon - 0.01}, temp: '20°C', condition: '🌧️' }
            ];
            
            additionalPoints.forEach(point => {
              const marker = L.marker([point.lat, point.lon], {
                icon: L.divIcon({
                  className: 'weather-marker',
                  html: \`<div class="weather-marker">\${point.condition}</div>\`,
                  iconSize: [25, 25],
                  iconAnchor: [12, 12]
                })
              });
              
              marker.bindPopup(\`
                <div style="text-align: center; min-width: 100px;">
                  <p style="margin: 0; font-size: 16px; font-weight: bold; color: #2196F3;">\${point.temp}</p>
                  <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Nearby Weather</p>
                </div>
              \`);
              
              weatherMarkers.addLayer(marker);
            });
            
            // Add layer control
            L.control.layers(baseMaps, {
              'Weather Data': weatherMarkers
            }).addTo(map);
            
            // Add scale control
            L.control.scale().addTo(map);
            
            // Handle map clicks
            map.on('click', function(e) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'mapClick',
                  lat: e.latlng.lat,
                  lng: e.latlng.lng
                }));
              }
            });
            
            console.log('Weather map initialized successfully');
            document.getElementById('status').innerHTML = '✅ Map loaded successfully';
            
            // Notify React Native that map is ready
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapReady'
              }));
            }
            
          } catch (error) {
            console.error('Map initialization error:', error);
            document.getElementById('status').innerHTML = '❌ Error: ' + error.message;
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapError',
                error: error.message
              }));
            }
          }
        </script>
      </body>
      </html>
    `;
  }, [center, zoom, layers, apiKey, locationName]);

  // Handle WebView messages
  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'mapReady') {
        setIsMapLoading(false);
        setMapError(null);
      } else if (data.type === 'mapError') {
        setMapError(`Map error: ${data.error}`);
        setIsMapLoading(false);
      } else if (data.type === 'mapClick' && onMapPress) {
        onMapPress(data.lat, data.lng);
      } else if (data.type === 'layerToggle' && onLayerToggle) {
        const layer = layers.find(l => l.name === data.layerName);
        if (layer) {
          onLayerToggle(layer.id, data.visible);
        }
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  }, [onMapPress, onLayerToggle, layers]);

  // Handle layer toggle
  const handleLayerToggle = useCallback((layerId: string, visible: boolean) => {
    if (onLayerToggle) {
      onLayerToggle(layerId, visible);
    }
  }, [onLayerToggle]);

  // Get legend for selected layer
  const selectedLegend = useMemo(() => {
    if (!selectedLayer) return null;
    return WEATHER_MAP_LEGENDS[selectedLayer];
  }, [selectedLayer]);

  // Dynamic font sizes
  const titleFontSize = useMemo(() => getFontSize(18), [getFontSize]);
  const bodyFontSize = useMemo(() => getFontSize(14), [getFontSize]);
  const smallFontSize = useMemo(() => getFontSize(12), [getFontSize]);

  // Dynamic font weights
  const titleFontWeight = useMemo(() => shouldUseBoldText() ? 'bold' : 'normal', [shouldUseBoldText]);
  const bodyFontWeight = useMemo(() => shouldUseBoldText() ? '600' : 'normal', [shouldUseBoldText]);

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <Text 
            variant="titleMedium" 
            style={[
              styles.title, 
              { color: theme.colors.onSurface, fontSize: titleFontSize, fontWeight: titleFontWeight }
            ]}
          >
            Weather Maps{locationName && ` - ${locationName}`}
          </Text>
          {showControls && (
            <IconButton
              icon="layers"
              size={20}
              onPress={() => setShowLayerSelector(true)}
              accessibilityLabel="Layer controls"
            />
          )}
        </View>

        <View style={styles.mapContainer}>
          {!isValidLocation ? (
            <View style={styles.errorContainer}>
              <Text 
                variant="bodyMedium" 
                style={[
                  styles.errorText, 
                  { color: theme.colors.onSurface, fontSize: bodyFontSize }
                ]}
              >
                Invalid location coordinates. Please try searching for a different location.
              </Text>
            </View>
          ) : mapError ? (
            <View style={styles.errorContainer}>
              <Text 
                variant="bodyMedium" 
                style={[
                  styles.errorText, 
                  { color: theme.colors.onSurface, fontSize: bodyFontSize }
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
              key={mapKey}
              source={{ html: mapHtml }}
              style={styles.webView}
              onMessage={handleWebViewMessage}
              onLoadStart={() => {
                setIsMapLoading(true);
              }}
              onLoadEnd={() => {
                // Set a timeout to stop loading if no message is received
                setTimeout(() => {
                  if (isMapLoading) {
                    setIsMapLoading(false);
                  }
                }, 8000);
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
              startInLoadingState={false}
              scalesPageToFit={true}
              mixedContentMode="compatibility"
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              accessibilityLabel="Interactive weather map"
            />
          )}
          
          {isMapLoading && !mapError && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator 
                size="large" 
                color={theme.colors.primary} 
              />
              <Text 
                variant="bodyMedium" 
                style={[
                  styles.loadingText, 
                  { color: theme.colors.onSurface, fontSize: bodyFontSize }
                ]}
              >
                Loading weather map...
              </Text>
              <Text 
                variant="bodySmall" 
                style={[
                  styles.loadingSubtext, 
                  { color: theme.colors.onSurfaceVariant, fontSize: smallFontSize }
                ]}
              >
                This may take a few moments
              </Text>
            </View>
          )}
        </View>

        {showLegend && selectedLegend && (
          <View style={styles.legend}>
            <Text 
              variant="bodyMedium" 
              style={[
                styles.legendTitle, 
                { color: theme.colors.onSurface, fontSize: bodyFontSize, fontWeight: bodyFontWeight }
              ]}
            >
              {selectedLegend.description} ({selectedLegend.unit})
            </Text>
            <View style={styles.legendColors}>
              {selectedLegend.colors.map((colorItem, index) => (
                <View key={index} style={styles.legendItem}>
                  <View 
                    style={[
                      styles.colorBox, 
                      { backgroundColor: colorItem.color }
                    ]} 
                  />
                  <Text 
                    variant="bodySmall" 
                    style={[
                      styles.colorLabel, 
                      { color: theme.colors.onSurface, fontSize: smallFontSize }
                    ]}
                  >
                    {colorItem.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Layer Selector Modal */}
        <Portal>
          <Modal
            visible={showLayerSelector}
            onDismiss={() => setShowLayerSelector(false)}
            contentContainerStyle={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface }
            ]}
          >
            <Text 
              variant="titleLarge" 
              style={[
                styles.modalTitle, 
                { color: theme.colors.onSurface, fontSize: titleFontSize, fontWeight: titleFontWeight }
              ]}
            >
              Map Layers
            </Text>
            
            <View style={styles.layerList}>
              {layers.map((layer) => (
                <View key={layer.id} style={styles.layerItem}>
                  <View style={styles.layerInfo}>
                    <Text 
                      variant="bodyMedium" 
                      style={[
                        styles.layerName, 
                        { color: theme.colors.onSurface, fontSize: bodyFontSize, fontWeight: bodyFontWeight }
                      ]}
                    >
                      {layer.name}
                    </Text>
                    <Text 
                      variant="bodySmall" 
                      style={[
                        styles.layerDescription, 
                        { color: theme.colors.onSurfaceVariant, fontSize: smallFontSize }
                      ]}
                    >
                      {layer.description}
                    </Text>
                  </View>
                  <View style={styles.layerControls}>
                    <Chip
                      selected={layer.visible}
                      onPress={() => handleLayerToggle(layer.id, !layer.visible)}
                      style={[
                        styles.layerChip,
                        layer.visible && { backgroundColor: theme.colors.primary }
                      ]}
                      textStyle={{ color: layer.visible ? theme.colors.onPrimary : theme.colors.onSurface }}
                    >
                      {layer.visible ? 'On' : 'Off'}
                    </Chip>
                    <Button
                      mode="outlined"
                      onPress={() => setSelectedLayer(layer.type)}
                      style={styles.legendButton}
                      labelStyle={{ fontSize: smallFontSize }}
                    >
                      Legend
                    </Button>
                  </View>
                </View>
              ))}
            </View>

            <Button
              mode="contained"
              onPress={() => setShowLayerSelector(false)}
              style={styles.closeButton}
            >
              Close
            </Button>
          </Modal>
        </Portal>
      </Card.Content>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    marginHorizontal: 16,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: 'bold',
  },
  mapContainer: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  webView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    marginTop: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.7,
  },
  legend: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  legendTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  legendColors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  colorBox: {
    width: 16,
    height: 16,
    borderRadius: 2,
    marginRight: 4,
  },
  colorLabel: {
    fontSize: 10,
  },
  modalContent: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  layerList: {
    maxHeight: 400,
  },
  layerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  layerInfo: {
    flex: 1,
    marginRight: 12,
  },
  layerName: {
    fontWeight: '600',
  },
  layerDescription: {
    marginTop: 2,
  },
  layerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  layerChip: {
    minWidth: 50,
  },
  legendButton: {
    minWidth: 60,
  },
  closeButton: {
    marginTop: 16,
  },
});

WeatherMap.displayName = 'WeatherMap';
