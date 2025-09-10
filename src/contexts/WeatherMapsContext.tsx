import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { WeatherMapConfig, WeatherMapLayer, DEFAULT_WEATHER_MAP_LAYERS, WeatherMapType } from '../types/weatherMaps';
import { storageService } from '../services';

interface WeatherMapsContextType {
  config: WeatherMapConfig;
  layers: WeatherMapLayer[];
  isInitialized: boolean;
  updateCenter: (lat: number, lon: number) => Promise<void>;
  updateZoom: (zoom: number) => Promise<void>;
  toggleLayer: (layerId: string, visible: boolean) => Promise<void>;
  updateLayerOpacity: (layerId: string, opacity: number) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  setSelectedLayer: (layerType: WeatherMapType | null) => void;
  selectedLayer: WeatherMapType | null;
}

const WeatherMapsContext = createContext<WeatherMapsContextType | undefined>(undefined);

interface WeatherMapsProviderProps {
  children: ReactNode;
}

const DEFAULT_CONFIG: WeatherMapConfig = {
  center: {
    lat: 40.7128,
    lon: -74.0060, // New York City
  },
  zoom: 8,
  layers: DEFAULT_WEATHER_MAP_LAYERS,
  showControls: true,
  showLegend: true,
  autoRefresh: true,
  refreshInterval: 15, // 15 minutes
};

export function WeatherMapsProvider({ children }: WeatherMapsProviderProps) {
  const [config, setConfig] = useState<WeatherMapConfig>(DEFAULT_CONFIG);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<WeatherMapType | null>(null);

  // Load configuration from storage
  const loadConfig = useCallback(async () => {
    try {
      const savedConfig = await storageService.getItem<WeatherMapConfig>('weather_maps_config');
      if (savedConfig) {
        setConfig(savedConfig);
      }
    } catch (error) {
      console.error('Error loading weather maps config:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save configuration to storage
  const saveConfig = useCallback(async (newConfig: WeatherMapConfig) => {
    try {
      await storageService.setItem('weather_maps_config', newConfig);
      setConfig(newConfig);
    } catch (error) {
      console.error('Error saving weather maps config:', error);
      throw error;
    }
  }, []);

  // Update map center
  const updateCenter = useCallback(async (lat: number, lon: number) => {
    const newConfig = {
      ...config,
      center: { lat, lon },
    };
    await saveConfig(newConfig);
  }, [config, saveConfig]);

  // Update map zoom
  const updateZoom = useCallback(async (zoom: number) => {
    const newConfig = {
      ...config,
      zoom: Math.max(1, Math.min(18, zoom)),
    };
    await saveConfig(newConfig);
  }, [config, saveConfig]);

  // Toggle layer visibility
  const toggleLayer = useCallback(async (layerId: string, visible: boolean) => {
    const newLayers = config.layers.map(layer =>
      layer.id === layerId ? { ...layer, visible } : layer
    );
    
    const newConfig = {
      ...config,
      layers: newLayers,
    };
    await saveConfig(newConfig);
  }, [config, saveConfig]);

  // Update layer opacity
  const updateLayerOpacity = useCallback(async (layerId: string, opacity: number) => {
    const clampedOpacity = Math.max(0, Math.min(1, opacity));
    const newLayers = config.layers.map(layer =>
      layer.id === layerId ? { ...layer, opacity: clampedOpacity } : layer
    );
    
    const newConfig = {
      ...config,
      layers: newLayers,
    };
    await saveConfig(newConfig);
  }, [config, saveConfig]);

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    await saveConfig(DEFAULT_CONFIG);
    setSelectedLayer(null);
  }, [saveConfig]);

  // Load config on mount
  React.useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const value: WeatherMapsContextType = {
    config,
    layers: config.layers,
    isInitialized,
    updateCenter,
    updateZoom,
    toggleLayer,
    updateLayerOpacity,
    resetToDefaults,
    setSelectedLayer,
    selectedLayer,
  };

  return (
    <WeatherMapsContext.Provider value={value}>
      {children}
    </WeatherMapsContext.Provider>
  );
}

export function useWeatherMaps(): WeatherMapsContextType {
  const context = useContext(WeatherMapsContext);
  if (context === undefined) {
    throw new Error('useWeatherMaps must be used within a WeatherMapsProvider');
  }
  return context;
}
