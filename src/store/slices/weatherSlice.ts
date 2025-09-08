import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CurrentWeather, WeatherForecast } from '../../types';

interface WeatherState {
  currentWeather: CurrentWeather | null;
  forecast: WeatherForecast | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const initialState: WeatherState = {
  currentWeather: null,
  forecast: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

export const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    setCurrentWeather: (state, action: PayloadAction<CurrentWeather>) => {
      state.currentWeather = action.payload;
      state.lastUpdated = new Date();
      state.error = null;
    },
    setForecast: (state, action: PayloadAction<WeatherForecast>) => {
      state.forecast = action.payload;
      state.lastUpdated = new Date();
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearWeather: (state) => {
      state.currentWeather = null;
      state.forecast = null;
      state.error = null;
      state.lastUpdated = null;
    },
  },
});

export const {
  setCurrentWeather,
  setForecast,
  setLoading,
  setError,
  clearWeather,
} = weatherSlice.actions;

export default weatherSlice.reducer;
