import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';

// Weather selectors
export const selectWeather = (state: RootState) => state.weather;
export const selectCurrentWeather = (state: RootState) => state.weather.currentWeather;
export const selectForecast = (state: RootState) => state.weather.forecast;
export const selectWeatherLoading = (state: RootState) => state.weather.isLoading;
export const selectWeatherError = (state: RootState) => state.weather.error;
export const selectLastUpdated = (state: RootState) => state.weather.lastUpdated;

// Location selectors
export const selectLocation = (state: RootState) => state.location;
export const selectCurrentLocation = (state: RootState) => state.location.currentLocation;
export const selectSelectedLocation = (state: RootState) => state.location.selectedLocation;
export const selectPermissionStatus = (state: RootState) => state.location.permissionStatus;

// Settings selectors
export const selectSettings = (state: RootState) => state.settings;
export const selectTemperatureUnit = (state: RootState) => state.settings.settings?.temperatureUnit || 'celsius';
export const selectWindSpeedUnit = (state: RootState) => state.settings.settings?.windSpeedUnit || 'kmh';
export const selectRainfallUnit = (state: RootState) => state.settings.settings?.rainfallUnit || 'mm';
export const selectDistanceUnit = (state: RootState) => state.settings.settings?.distanceUnit || 'km';

// Memoized selectors for complex computations
export const selectWeatherData = createSelector(
  [selectCurrentWeather, selectForecast, selectWeatherLoading, selectWeatherError],
  (currentWeather, forecast, isLoading, error) => ({
    currentWeather,
    forecast,
    isLoading,
    error,
    hasData: !!(currentWeather || forecast),
  })
);

export const selectLocationData = createSelector(
  [selectCurrentLocation, selectPermissionStatus],
  (currentLocation, permissionStatus) => ({
    currentLocation,
    permissionStatus,
    hasLocation: !!currentLocation,
    isPermissionGranted: permissionStatus.status === 'granted',
  })
);

export const selectUnits = createSelector(
  [selectTemperatureUnit, selectWindSpeedUnit, selectRainfallUnit, selectDistanceUnit],
  (temperature, windSpeed, rainfall, distance) => ({
    temperature,
    windSpeed,
    rainfall,
    distance,
  })
);

// Selector for weather card data
export const selectWeatherCardData = createSelector(
  [selectCurrentWeather, selectUnits],
  (currentWeather, units) => {
    if (!currentWeather) return null;
    
    return {
      weather: currentWeather,
      units,
      mainCondition: currentWeather.weather[0],
      main: currentWeather.main,
      wind: currentWeather.wind,
      sys: currentWeather.sys,
    };
  }
);

// Selector for forecast data
export const selectForecastData = createSelector(
  [selectForecast, selectUnits],
  (forecast, units) => {
    if (!forecast) return null;
    
    return {
      forecast,
      units,
      list: forecast.list,
      city: forecast.city,
    };
  }
);

// Selector for app state
export const selectAppState = createSelector(
  [selectWeatherData, selectLocationData],
  (weatherData, locationData) => ({
    ...weatherData,
    ...locationData,
    isReady: weatherData.hasData && locationData.hasLocation,
  })
);
