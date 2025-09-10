import { NetworkError, RetryConfig, DEFAULT_RETRY_CONFIG } from '../types/networkErrors';
import { networkErrorHandler } from './networkErrorHandler';

export interface RetryOptions {
  config?: RetryConfig;
  onRetry?: (attempt: number, error: NetworkError) => void;
  onMaxRetriesReached?: (error: NetworkError) => void;
  context?: string;
}

export class RetryHandler {
  private static instance: RetryHandler;

  static getInstance(): RetryHandler {
    if (!RetryHandler.instance) {
      RetryHandler.instance = new RetryHandler();
    }
    return RetryHandler.instance;
  }

  /**
   * Execute a function with retry logic
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const config = options.config || DEFAULT_RETRY_CONFIG;
    const context = options.context || 'RetryHandler';
    let lastError: NetworkError | null = null;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const result = await fn();
        return result;
      } catch (error) {
        const networkError = networkErrorHandler.createNetworkError(error);
        lastError = networkError;

        // Log the error
        networkErrorHandler.logError(networkError, context);

        // Check if we should retry
        if (!networkErrorHandler.shouldRetry(networkError, attempt)) {
          break;
        }

        // Call retry callback
        if (options.onRetry) {
          options.onRetry(attempt, networkError);
        }

        // Calculate delay for next attempt
        const delay = networkErrorHandler.getRetryDelay(networkError, attempt);
        
        if (delay > 0) {
          await this.delay(delay);
        }
      }
    }

    // All retries failed
    if (lastError && options.onMaxRetriesReached) {
      options.onMaxRetriesReached(lastError);
    }

    throw lastError || new Error('Max retries reached');
  }

  /**
   * Execute a function with retry logic and fallback
   */
  async executeWithRetryAndFallback<T>(
    fn: () => Promise<T>,
    fallback: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    try {
      return await this.executeWithRetry(fn, options);
    } catch (error) {
      console.warn('Primary operation failed, using fallback:', error);
      return await fallback();
    }
  }

  /**
   * Execute multiple functions in parallel with retry logic
   */
  async executeParallelWithRetry<T>(
    functions: Array<() => Promise<T>>,
    options: RetryOptions = {}
  ): Promise<T[]> {
    const promises = functions.map(fn => 
      this.executeWithRetry(fn, options)
    );

    return Promise.allSettled(promises).then(results => {
      const successful: T[] = [];
      const errors: Error[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value);
        } else {
          errors.push(result.reason);
          console.error(`Parallel operation ${index} failed:`, result.reason);
        }
      });

      // If all operations failed, throw the first error
      if (successful.length === 0 && errors.length > 0) {
        throw errors[0];
      }

      return successful;
    });
  }

  /**
   * Execute a function with retry logic and timeout
   */
  async executeWithTimeoutAndRetry<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
    options: RetryOptions = {}
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    const operationWithTimeout = () => Promise.race([fn(), timeoutPromise]);

    return this.executeWithRetry(operationWithTimeout, options);
  }

  /**
   * Delay execution for specified milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create a retryable function wrapper
   */
  createRetryableFunction<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options: RetryOptions = {}
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      return this.executeWithRetry(() => fn(...args), options);
    };
  }

  /**
   * Create a retryable function with fallback
   */
  createRetryableFunctionWithFallback<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    fallback: (...args: T) => Promise<R>,
    options: RetryOptions = {}
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      return this.executeWithRetryAndFallback(
        () => fn(...args),
        () => fallback(...args),
        options
      );
    };
  }
}

export const retryHandler = RetryHandler.getInstance();
