export interface SmartDevice {
  id: string;
  name: string;
  type: 'thermostat' | 'garden_system' | 'outdoor_equipment' | 'energy_monitor' | 'security' | 'lighting';
  location: string;
  status: 'online' | 'offline' | 'error';
  isConnected: boolean;
  lastSeen: Date;
  capabilities: string[];
  settings: Record<string, any>;
}

export interface ThermostatControl {
  deviceId: string;
  currentTemperature: number;
  targetTemperature: number;
  mode: 'heat' | 'cool' | 'auto' | 'off';
  fanSpeed: 'low' | 'medium' | 'high' | 'auto';
  schedule: {
    time: string;
    temperature: number;
    mode: 'heat' | 'cool' | 'auto';
  }[];
  weatherAdjustment: {
    enabled: boolean;
    temperatureOffset: number;
    humidityOffset: number;
  };
}

export interface GardenCareAlert {
  id: string;
  type: 'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'protection';
  priority: 'low' | 'medium' | 'high';
  message: string;
  recommendedAction: string;
  dueDate: Date;
  weatherDependency: {
    condition: string;
    temperature: {
      min: number;
      max: number;
    };
    humidity: {
      min: number;
      max: number;
    };
  };
  isActive: boolean;
}

export interface OutdoorEquipmentAlert {
  id: string;
  equipmentType: 'grill' | 'pool' | 'furniture' | 'tools' | 'decorations';
  action: 'cover' | 'uncover' | 'store' | 'maintain' | 'protect';
  priority: 'low' | 'medium' | 'high';
  message: string;
  recommendedAction: string;
  dueDate: Date;
  weatherCondition: string;
  isActive: boolean;
}

export interface EnergyOptimization {
  deviceId: string;
  deviceType: string;
  currentUsage: number; // kWh
  weatherImpact: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    solarIrradiance: number;
  };
  recommendations: {
    action: string;
    potentialSavings: number; // percentage
    reason: string;
    priority: 'low' | 'medium' | 'high';
  }[];
  optimalSettings: Record<string, any>;
}

export interface SmartHomeScene {
  id: string;
  name: string;
  description: string;
  weatherCondition: string;
  temperatureRange: {
    min: number;
    max: number;
  };
  devices: {
    deviceId: string;
    action: string;
    settings: Record<string, any>;
  }[];
  isActive: boolean;
  lastTriggered: Date;
}

export interface IoTIntegration {
  platform: 'homeassistant' | 'smartthings' | 'alexa' | 'google_home' | 'apple_homekit';
  status: 'connected' | 'disconnected' | 'error';
  devices: SmartDevice[];
  lastSync: Date;
  capabilities: string[];
}

export interface SmartHomeSettings {
  weatherIntegration: {
    enabled: boolean;
    updateInterval: number; // minutes
    temperatureThreshold: number;
    humidityThreshold: number;
    windThreshold: number;
  };
  automation: {
    enabled: boolean;
    scenes: SmartHomeScene[];
    schedules: any[];
  };
  notifications: {
    enabled: boolean;
    gardenAlerts: boolean;
    equipmentAlerts: boolean;
    energyAlerts: boolean;
    weatherAlerts: boolean;
  };
  privacy: {
    dataSharing: boolean;
    locationSharing: boolean;
    deviceControl: boolean;
  };
}
