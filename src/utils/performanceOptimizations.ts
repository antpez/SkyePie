import { performanceMonitor } from './performanceMonitor';

/**
 * Performance optimization utilities for React Native
 */

// Debounce function for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Memoize expensive calculations
export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Batch operations for better performance
export class BatchProcessor<T> {
  private batch: T[] = [];
  private batchSize: number;
  private timeout: number;
  private processor: (items: T[]) => Promise<void> | void;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(
    processor: (items: T[]) => Promise<void> | void,
    batchSize: number = 10,
    timeout: number = 100
  ) {
    this.processor = processor;
    this.batchSize = batchSize;
    this.timeout = timeout;
  }

  add(item: T): void {
    this.batch.push(item);
    
    if (this.batch.length >= this.batchSize) {
      this.flush();
    } else if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => this.flush(), this.timeout);
    }
  }

  async flush(): Promise<void> {
    if (this.batch.length === 0) return;
    
    const items = [...this.batch];
    this.batch = [];
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    await this.processor(items);
  }
}

// Image preloading utility
export const preloadImages = async (imageSources: (string | number)[]): Promise<void> => {
  return performanceMonitor.measureAsync('preloadImages', async () => {
    const { Image } = require('react-native');
    
    const preloadPromises = imageSources.map((source) => {
      return new Promise<void>((resolve, reject) => {
        Image.prefetch(source)
          .then(() => resolve())
          .catch(reject);
      });
    });
    
    await Promise.allSettled(preloadPromises);
  }, { imageCount: imageSources.length });
};

// Lazy loading utility
export const createLazyComponent = <P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  fallback?: React.ComponentType
) => {
  const React = require('react');
  return React.lazy(importFunc);
};

// Memory usage monitoring
export const getMemoryUsage = (): {
  used: number;
  total: number;
  percentage: number;
} => {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
    };
  }
  
  return { used: 0, total: 0, percentage: 0 };
};

// Performance-aware list rendering
export const createVirtualizedListProps = (
  itemHeight: number,
  containerHeight: number,
  dataLength: number
) => {
  const visibleItems = Math.ceil(containerHeight / itemHeight) + 2; // Buffer of 2 items
  
  return {
    getItemLayout: (data: any, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
    initialNumToRender: visibleItems,
    maxToRenderPerBatch: visibleItems,
    windowSize: visibleItems,
    removeClippedSubviews: true,
    updateCellsBatchingPeriod: 50,
  };
};

// Network request optimization
export const createOptimizedRequest = (
  baseUrl: string,
  timeout: number = 10000,
  retries: number = 3
) => {
  return {
    baseURL: baseUrl,
    timeout,
    retries,
    retryDelay: (retryCount: number) => Math.pow(2, retryCount) * 1000,
    retryCondition: (error: any) => {
      return error.code === 'NETWORK_ERROR' || error.response?.status >= 500;
    },
  };
};

// Bundle size optimization
export const createCodeSplitComponent = <P extends object>(
  componentName: string,
  importFunc: () => Promise<{ default: React.ComponentType<P> }>
) => {
  const React = require('react');
  const LazyComponent = React.lazy(importFunc);
  
  return React.forwardRef<any, P>((props, ref) => (
    <React.Suspense fallback={<div>Loading {componentName}...</div>}>
      <LazyComponent {...props} ref={ref} />
    </React.Suspense>
  ));
};

// Performance metrics collection
export class PerformanceMetrics {
  private static instance: PerformanceMetrics;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMetrics {
    if (!PerformanceMetrics.instance) {
      PerformanceMetrics.instance = new PerformanceMetrics();
    }
    return PerformanceMetrics.instance;
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  getAverageMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  getMetricStats(name: string): {
    average: number;
    min: number;
    max: number;
    count: number;
  } {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) {
      return { average: 0, min: 0, max: 0, count: 0 };
    }

    return {
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

export const performanceMetrics = PerformanceMetrics.getInstance();
