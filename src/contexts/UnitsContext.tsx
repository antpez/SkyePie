import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { WeatherUnits, TemperatureUnit, WindSpeedUnit, PressureUnit, DistanceUnit, DEFAULT_UNITS } from '../types/units';
import { storageService } from '../services';

interface UnitsContextType {
  units: WeatherUnits;
  setTemperatureUnit: (unit: TemperatureUnit) => Promise<void>;
  setWindSpeedUnit: (unit: WindSpeedUnit) => Promise<void>;
  setPressureUnit: (unit: PressureUnit) => Promise<void>;
  setDistanceUnit: (unit: DistanceUnit) => Promise<void>;
  setUnits: (units: WeatherUnits) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  isLoading: boolean;
}

const UnitsContext = createContext<UnitsContextType | undefined>(undefined);

interface UnitsProviderProps {
  children: ReactNode;
}

export function UnitsProvider({ children }: UnitsProviderProps) {
  const [units, setUnitsState] = useState<WeatherUnits>(DEFAULT_UNITS);
  const [isLoading, setIsLoading] = useState(true);

  // Load units from storage
  const loadUnits = useCallback(async () => {
    try {
      const savedUnits = await storageService.getItem<WeatherUnits>('weather_units');
      if (savedUnits) {
        setUnitsState(savedUnits);
      }
    } catch (error) {
      console.error('Error loading units:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save units to storage
  const saveUnits = useCallback(async (newUnits: WeatherUnits) => {
    try {
      await storageService.setItem('weather_units', newUnits);
      setUnitsState(newUnits);
    } catch (error) {
      console.error('Error saving units:', error);
      throw error;
    }
  }, []);

  // Set temperature unit
  const setTemperatureUnit = useCallback(async (unit: TemperatureUnit) => {
    const newUnits = { ...units, temperature: unit };
    await saveUnits(newUnits);
  }, [units, saveUnits]);

  // Set wind speed unit
  const setWindSpeedUnit = useCallback(async (unit: WindSpeedUnit) => {
    const newUnits = { ...units, windSpeed: unit };
    await saveUnits(newUnits);
  }, [units, saveUnits]);

  // Set pressure unit
  const setPressureUnit = useCallback(async (unit: PressureUnit) => {
    const newUnits = { ...units, pressure: unit };
    await saveUnits(newUnits);
  }, [units, saveUnits]);

  // Set distance unit
  const setDistanceUnit = useCallback(async (unit: DistanceUnit) => {
    const newUnits = { ...units, distance: unit };
    await saveUnits(newUnits);
  }, [units, saveUnits]);

  // Set all units
  const setUnits = useCallback(async (newUnits: WeatherUnits) => {
    await saveUnits(newUnits);
  }, [saveUnits]);

  // Reset to default units
  const resetToDefaults = useCallback(async () => {
    await saveUnits(DEFAULT_UNITS);
  }, [saveUnits]);

  // Load units on mount
  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const value: UnitsContextType = {
    units,
    setTemperatureUnit,
    setWindSpeedUnit,
    setPressureUnit,
    setDistanceUnit,
    setUnits,
    resetToDefaults,
    isLoading,
  };

  return (
    <UnitsContext.Provider value={value}>
      {children}
    </UnitsContext.Provider>
  );
}

export function useUnits(): UnitsContextType {
  const context = useContext(UnitsContext);
  if (context === undefined) {
    throw new Error('useUnits must be used within a UnitsProvider');
  }
  return context;
}
