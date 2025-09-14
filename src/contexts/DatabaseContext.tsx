import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { databaseConnection } from '../database';

interface DatabaseContextType {
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
  isInitialized: false,
  isInitializing: true,
  error: null,
});

interface DatabaseProviderProps {
  children: ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setIsInitializing(true);
        setError(null);
        
        await databaseConnection.initialize();
        
        setIsInitialized(true);
        // if (__DEV__) {
        //   console.log('Database initialized successfully');
        // }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Database initialization failed';
        console.error('Database initialization failed:', err);
        setError(errorMessage);
        setIsInitialized(false);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeDatabase();
  }, []);

  return (
    <DatabaseContext.Provider value={{ isInitialized, isInitializing, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
