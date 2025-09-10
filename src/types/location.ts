export interface Location {
  id: string;
  userId?: string;
  name: string;
  country: string;
  state?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  isCurrent: boolean;
  isFavorite: boolean;
  searchCount: number;
  lastSearched?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationSearchResult {
  name: string;
  country: string;
  state?: string;
  latitude: number;
  longitude: number;
  displayName: string;
}

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

export interface LocationError {
  code: string;
  message: string;
  type: 'permission' | 'service' | 'timeout' | 'unknown';
}

export type LocationAccuracy = 'high' | 'medium' | 'low';
export type SearchType = 'manual' | 'gps' | 'suggestion';

export interface SearchHistoryItem {
  id: string;
  query: string;
  locationId?: string;
  searchType: SearchType;
  createdAt: Date;
}
