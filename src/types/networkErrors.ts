export interface NetworkError {
  code: string;
  message: string;
  type: NetworkErrorType;
  details?: any;
  timestamp: number;
  retryable: boolean;
  retryAfter?: number; // seconds
}

export type NetworkErrorType = 
  | 'CONNECTION_ERROR'
  | 'TIMEOUT_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'SERVER_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'PERMISSION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

export interface NetworkStatus {
  isOnline: boolean;
  connectionType?: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  isSlowConnection: boolean;
  lastChecked: number;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
}

export interface NetworkErrorHandler {
  handleError: (error: NetworkError) => void;
  shouldRetry: (error: NetworkError, attempt: number) => boolean;
  getRetryDelay: (error: NetworkError, attempt: number) => number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 4, // Increased attempts for better accuracy
  baseDelay: 500, // Reduced initial delay for faster retries
  maxDelay: 15000, // Increased max delay for better reliability
  backoffMultiplier: 1.5, // Gentler backoff for better user experience
};

export const NETWORK_ERROR_CODES = {
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;
