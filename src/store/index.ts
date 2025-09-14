import { configureStore } from '@reduxjs/toolkit';
import { weatherSlice } from './slices/weatherSlice';
import { locationSlice } from './slices/locationSlice';
import { settingsSlice } from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    weather: weatherSlice.reducer,
    location: locationSlice.reducer,
    settings: settingsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'location/setCurrentLocation',
          'location/setSelectedLocation'
        ],
        ignoredPaths: [
          'weather.lastUpdated', 
          'location.lastUpdated',
          'location.currentLocation.createdAt',
          'location.currentLocation.updatedAt',
          'location.currentLocation.lastSearched',
          'location.selectedLocation.createdAt',
          'location.selectedLocation.updatedAt',
          'location.selectedLocation.lastSearched',
          'location.favoriteLocations.createdAt',
          'location.favoriteLocations.updatedAt',
          'location.favoriteLocations.lastSearched',
          'settings.settings.createdAt',
          'settings.settings.updatedAt'
        ],
      },
      immutableCheck: {
        ignoredPaths: [
          'weather.lastUpdated', 
          'location.lastUpdated',
          'location.currentLocation.createdAt',
          'location.currentLocation.updatedAt',
          'location.currentLocation.lastSearched',
          'location.selectedLocation.createdAt',
          'location.selectedLocation.updatedAt',
          'location.selectedLocation.lastSearched',
          'location.favoriteLocations.createdAt',
          'location.favoriteLocations.updatedAt',
          'location.favoriteLocations.lastSearched',
          'settings.settings.createdAt',
          'settings.settings.updatedAt'
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export selectors
export * from './selectors';
