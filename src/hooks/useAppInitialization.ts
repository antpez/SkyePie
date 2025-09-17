import { useState, useEffect } from 'react';
import { appInitializer, AppInitializationState } from '../utils/appInitializer';

export const useAppInitialization = () => {
  const [state, setState] = useState<AppInitializationState>(appInitializer.getState());

  useEffect(() => {
    const unsubscribe = appInitializer.subscribe(setState);
    return unsubscribe;
  }, []);

  return state;
};
