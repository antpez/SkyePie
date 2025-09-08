import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Location, LocationSearchResult, LocationPermissionStatus } from '../../types';

interface LocationState {
  currentLocation: Location | null;
  favoriteLocations: Location[];
  searchHistory: LocationSearchResult[];
  permissionStatus: LocationPermissionStatus;
  isLoading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  currentLocation: null,
  favoriteLocations: [],
  searchHistory: [],
  permissionStatus: {
    granted: false,
    canAskAgain: true,
    status: 'undetermined',
  },
  isLoading: false,
  error: null,
};

export const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<Location>) => {
      state.currentLocation = action.payload;
      state.error = null;
    },
    setFavoriteLocations: (state, action: PayloadAction<Location[]>) => {
      state.favoriteLocations = action.payload;
    },
    addFavoriteLocation: (state, action: PayloadAction<Location>) => {
      const exists = state.favoriteLocations.some(
        loc => loc.id === action.payload.id
      );
      if (!exists) {
        state.favoriteLocations.push(action.payload);
      }
    },
    removeFavoriteLocation: (state, action: PayloadAction<string>) => {
      state.favoriteLocations = state.favoriteLocations.filter(
        loc => loc.id !== action.payload
      );
    },
    setSearchHistory: (state, action: PayloadAction<LocationSearchResult[]>) => {
      state.searchHistory = action.payload;
    },
    addSearchHistory: (state, action: PayloadAction<LocationSearchResult>) => {
      // Remove existing entry with same coordinates
      state.searchHistory = state.searchHistory.filter(
        item => !(
          Math.abs(item.latitude - action.payload.latitude) < 0.0001 &&
          Math.abs(item.longitude - action.payload.longitude) < 0.0001
        )
      );
      // Add new entry to beginning
      state.searchHistory.unshift(action.payload);
      // Keep only last 10 items
      state.searchHistory = state.searchHistory.slice(0, 10);
    },
    clearSearchHistory: (state) => {
      state.searchHistory = [];
    },
    setPermissionStatus: (state, action: PayloadAction<LocationPermissionStatus>) => {
      state.permissionStatus = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearLocation: (state) => {
      state.currentLocation = null;
      state.error = null;
    },
  },
});

export const {
  setCurrentLocation,
  setFavoriteLocations,
  addFavoriteLocation,
  removeFavoriteLocation,
  setSearchHistory,
  addSearchHistory,
  clearSearchHistory,
  setPermissionStatus,
  setLoading,
  setError,
  clearLocation,
} = locationSlice.actions;

export default locationSlice.reducer;
