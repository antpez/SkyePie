import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserSettings, TemperatureUnit, WindSpeedUnit, PressureUnit } from '../../types';

interface SettingsState {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
}

const defaultSettings: UserSettings = {
  id: '',
  userId: '',
  temperatureUnit: 'celsius',
  windSpeedUnit: 'kmh',
  pressureUnit: 'hpa',
  distanceUnit: 'km',
  theme: 'system',
  notificationsEnabled: true,
  locationAccuracy: 'high',
  autoRefreshInterval: 15,
  showFeelsLike: true,
  showHumidity: true,
  showWindSpeed: true,
  showPressure: false,
  showUVIndex: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const initialState: SettingsState = {
  settings: defaultSettings,
  isLoading: false,
  error: null,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<UserSettings>) => {
      state.settings = action.payload;
      state.error = null;
    },
    updateTemperatureUnit: (state, action: PayloadAction<TemperatureUnit>) => {
      if (state.settings) {
        state.settings.temperatureUnit = action.payload;
        state.settings.updatedAt = new Date();
      }
    },
    updateWindSpeedUnit: (state, action: PayloadAction<WindSpeedUnit>) => {
      if (state.settings) {
        state.settings.windSpeedUnit = action.payload;
        state.settings.updatedAt = new Date();
      }
    },
    updatePressureUnit: (state, action: PayloadAction<PressureUnit>) => {
      if (state.settings) {
        state.settings.pressureUnit = action.payload;
        state.settings.updatedAt = new Date();
      }
    },
    updateTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      if (state.settings) {
        state.settings.theme = action.payload;
        state.settings.updatedAt = new Date();
      }
    },
    updateNotifications: (state, action: PayloadAction<boolean>) => {
      if (state.settings) {
        state.settings.notificationsEnabled = action.payload;
        state.settings.updatedAt = new Date();
      }
    },
    updateLocationAccuracy: (state, action: PayloadAction<'high' | 'medium' | 'low'>) => {
      if (state.settings) {
        state.settings.locationAccuracy = action.payload;
        state.settings.updatedAt = new Date();
      }
    },
    updateAutoRefreshInterval: (state, action: PayloadAction<number>) => {
      if (state.settings) {
        state.settings.autoRefreshInterval = action.payload;
        state.settings.updatedAt = new Date();
      }
    },
    updateDisplayPreference: (state, action: PayloadAction<{
      key: keyof Pick<UserSettings, 'showFeelsLike' | 'showHumidity' | 'showWindSpeed' | 'showPressure' | 'showUVIndex'>;
      value: boolean;
    }>) => {
      if (state.settings) {
        state.settings[action.payload.key] = action.payload.value;
        state.settings.updatedAt = new Date();
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetSettings: (state) => {
      state.settings = defaultSettings;
      state.error = null;
    },
  },
});

export const {
  setSettings,
  updateTemperatureUnit,
  updateWindSpeedUnit,
  updatePressureUnit,
  updateTheme,
  updateNotifications,
  updateLocationAccuracy,
  updateAutoRefreshInterval,
  updateDisplayPreference,
  setLoading,
  setError,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
