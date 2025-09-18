import { NetworkError, NetworkErrorType, RetryConfig, DEFAULT_RETRY_CONFIG } from '../types/networkErrors';

export class NetworkErrorHandler {
  private static instance: NetworkErrorHandler;
  private retryConfig: RetryConfig;

  constructor(retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG) {
    this.retryConfig = retryConfig;
  }

  static getInstance(retryConfig?: RetryConfig): NetworkErrorHandler {
    if (!NetworkErrorHandler.instance) {
      NetworkErrorHandler.instance = new NetworkErrorHandler(retryConfig);
    }
    return NetworkErrorHandler.instance;
  }

  /**
   * Detects the type of network error from an axios error
   */
  detectErrorType(error: any): NetworkErrorType {
    // Check for canceled/aborted requests first
    if (error.name === 'AbortError' || error.message?.includes('canceled') || error.message?.includes('aborted')) {
      return 'CONNECTION_ERROR'; // Treat as connection error but don't show error UI
    }

    // Check for specific error codes first
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'TIMEOUT_ERROR';
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ENETUNREACH') {
      return 'CONNECTION_ERROR';
    }

    if (error.code === 'ECONNRESET' || error.code === 'EPIPE') {
      return 'CONNECTION_ERROR';
    }

    // Check HTTP status codes
    if (error.response?.status) {
      const status = error.response.status;
      
      if (status === 401) {
        return 'AUTHENTICATION_ERROR';
      }
      
      if (status === 403) {
        return 'PERMISSION_ERROR';
      }
      
      if (status === 404) {
        return 'NOT_FOUND_ERROR';
      }
      
      if (status === 422) {
        return 'VALIDATION_ERROR';
      }
      
      if (status === 429) {
        return 'RATE_LIMIT_ERROR';
      }
      
      if (status >= 500) {
        return 'SERVER_ERROR';
      }
    }

    // Check for network-related error messages
    if (error.message?.includes('Network Error') || error.message?.includes('network')) {
      return 'CONNECTION_ERROR';
    }

    if (error.message?.includes('timeout') || error.message?.includes('TIMEOUT')) {
      return 'TIMEOUT_ERROR';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * Creates a standardized network error object
   */
  createNetworkError(
    error: any, 
    type?: NetworkErrorType,
    customMessage?: string
  ): NetworkError {
    const errorType = type || this.detectErrorType(error);
    const message = customMessage || this.getErrorMessage(error, errorType);
    
    return {
      code: error.code || errorType,
      message,
      type: errorType,
      details: error.response?.data || error.details,
      timestamp: Date.now(),
      retryable: this.isRetryable(errorType),
      retryAfter: this.getRetryAfter(error, errorType),
    };
  }

  /**
   * Determines if an error type is retryable
   */
  private isRetryable(type: NetworkErrorType): boolean {
    const retryableTypes: NetworkErrorType[] = [
      'CONNECTION_ERROR',
      'TIMEOUT_ERROR',
      'SERVER_ERROR',
      'RATE_LIMIT_ERROR',
    ];
    
    return retryableTypes.includes(type);
  }

  /**
   * Gets the retry delay for exponential backoff
   */
  getRetryDelay(error: NetworkError, attempt: number): number {
    if (!this.isRetryable(error.type)) {
      return 0;
    }

    const delay = Math.min(
      this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
      this.retryConfig.maxDelay
    );

    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    return Math.floor(delay + jitter);
  }

  /**
   * Determines if a request should be retried
   */
  shouldRetry(error: NetworkError, attempt: number): boolean {
    if (!this.isRetryable(error.type)) {
      return false;
    }

    if (attempt >= this.retryConfig.maxAttempts) {
      return false;
    }

    // Don't retry rate limit errors immediately
    if (error.type === 'RATE_LIMIT_ERROR' && error.retryAfter) {
      return false; // Let the caller handle the retry after delay
    }

    return true;
  }

  /**
   * Gets user-friendly error messages
   */
  private getErrorMessage(error: any, type: NetworkErrorType): string {
    switch (type) {
      case 'CONNECTION_ERROR':
        return 'Unable to connect to the weather service. Please check your internet connection.';
      
      case 'TIMEOUT_ERROR':
        return 'Request timed out. Please check your internet connection and try again.';
      
      case 'RATE_LIMIT_ERROR':
        return 'Too many requests. Please wait a moment before trying again.';
      
      case 'SERVER_ERROR':
        return 'Weather service is temporarily unavailable. Please try again later.';
      
      case 'AUTHENTICATION_ERROR':
        return 'Invalid API key. Please check your OpenWeatherMap API key.';
      
      case 'PERMISSION_ERROR':
        return 'Access denied. Please check your API permissions.';
      
      case 'NOT_FOUND_ERROR':
        return 'Weather data not found for this location.';
      
      case 'VALIDATION_ERROR':
        return 'Invalid request. Please check your input and try again.';
      
      case 'UNKNOWN_ERROR':
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Gets retry after delay from error response
   */
  private getRetryAfter(error: any, type: NetworkErrorType): number | undefined {
    if (type === 'RATE_LIMIT_ERROR') {
      // Check for Retry-After header
      const retryAfter = error.response?.headers?.['retry-after'];
      if (retryAfter) {
        return parseInt(retryAfter, 10);
      }
      
      // Default rate limit retry delay
      return 60; // 1 minute
    }
    
    return undefined;
  }

  /**
   * Logs network errors for debugging
   */
  logError(error: NetworkError, context?: string): void {
    const logData = {
      context: context || 'NetworkErrorHandler',
      error: {
        code: error.code,
        type: error.type,
        message: error.message,
        retryable: error.retryable,
        retryAfter: error.retryAfter,
        timestamp: new Date(error.timestamp).toISOString(),
      },
      details: error.details,
    };

    if (error.type === 'UNKNOWN_ERROR' || error.type === 'SERVER_ERROR') {
      console.error('Network Error:', logData);
    } else {
      console.warn('Network Error:', logData);
    }
  }
}

export const networkErrorHandler = NetworkErrorHandler.getInstance();
