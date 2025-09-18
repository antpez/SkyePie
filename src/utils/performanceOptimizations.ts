import { LocationCoordinates } from '../types';

/**
 * Performance optimization utilities
 */

// Debounce function to limit rapid function calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Throttle function to limit function calls to once per interval
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Check if two locations are significantly different
export function hasLocationChanged(
  oldLocation: LocationCoordinates | null,
  newLocation: LocationCoordinates | null,
  threshold: number = 0.001
): boolean {
  if (!oldLocation || !newLocation) return true;
  
  const latDiff = Math.abs(newLocation.latitude - oldLocation.latitude);
  const lonDiff = Math.abs(newLocation.longitude - oldLocation.longitude);
  
  return latDiff > threshold || lonDiff > threshold;
}

// Memoize expensive calculations
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  }) as T;
}

// Batch multiple operations together
export class BatchProcessor<T> {
  private queue: T[] = [];
  private processor: (items: T[]) => Promise<void> | void;
  private batchSize: number;
  private delay: number;
  private timeout: NodeJS.Timeout | null = null;

  constructor(
    processor: (items: T[]) => Promise<void> | void,
    batchSize: number = 10,
    delay: number = 100
  ) {
    this.processor = processor;
    this.batchSize = batchSize;
    this.delay = delay;
  }

  add(item: T): void {
    this.queue.push(item);
    
    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else if (!this.timeout) {
      this.timeout = setTimeout(() => this.flush(), this.delay);
    }
  }

  async flush(): Promise<void> {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    
    if (this.queue.length === 0) return;
    
    const items = [...this.queue];
    this.queue = [];
    
    await this.processor(items);
  }
}

// Optimize image loading
export function optimizeImageUrl(url: string, width?: number, height?: number): string {
  if (!url) return url;
  
  // Add query parameters for optimization if supported by the service
  const urlObj = new URL(url);
  
  if (width) urlObj.searchParams.set('w', width.toString());
  if (height) urlObj.searchParams.set('h', height.toString());
  urlObj.searchParams.set('q', '80'); // Quality setting
  urlObj.searchParams.set('f', 'webp'); // Use WebP format
  
  return urlObj.toString();
}

// Lazy load components
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
): React.LazyExoticComponent<T> {
  return React.lazy(importFunc);
}

// Performance monitoring wrapper
export function withPerformanceTracking<T extends (...args: any[]) => any>(
  func: T,
  name: string,
  threshold: number = 100
): T {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = func(...args);
    const duration = performance.now() - start;
    
    if (duration > threshold) {
      console.warn(`🐌 Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }) as T;
}

// Memory usage monitoring
export function logMemoryUsage(context: string): void {
  if (__DEV__ && (performance as any).memory) {
    const memory = (performance as any).memory;
    console.log(`📊 Memory usage (${context}):`, {
      used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`,
    });
  }
}

// Clean up resources
export function cleanupResources(): void {
  // Clear any global caches or timers
  if (typeof window !== 'undefined') {
    // Clear any global intervals or timeouts
    const highestTimeoutId = setTimeout(() => {}, 0);
    for (let i = 0; i < highestTimeoutId; i++) {
      clearTimeout(i);
    }
  }
}