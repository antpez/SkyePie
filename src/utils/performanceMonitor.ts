import React from 'react';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  totalCalls: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  lastCall?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private stats: Map<string, PerformanceStats> = new Map();
  private isEnabled: boolean = __DEV__; // Only enable in development
  private logThreshold: number = 100; // Reduced threshold for better performance monitoring
  private logLevel: 'none' | 'slow' | 'all' = 'slow'; // Default to slow operations only
  private maxMetrics: number = 1000; // Limit memory usage

  startTiming(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const startTime = performance.now();
    this.metrics.set(name, {
      name,
      startTime,
      metadata,
    });
  }

  endTiming(name: string): number | null {
    if (!this.isEnabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      // Don't warn for missing metrics - this can happen with concurrent calls
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Update stats
    this.updateStats(name, duration);

    // Log based on configuration
    if (__DEV__ && this.logLevel !== 'none') {
      const isSlowOperation = duration > this.logThreshold;
      const isError = metric.metadata?.error;
      const shouldLog = this.logLevel === 'all' || (this.logLevel === 'slow' && (isSlowOperation || isError));
      
      if (shouldLog) {
        const emoji = isError ? '❌' : isSlowOperation ? '🐌' : '⏱️';
        console.log(`${emoji} ${name}: ${duration.toFixed(2)}ms`, metric.metadata);
      }
    }

    // Remove from active metrics
    this.metrics.delete(name);

    return duration;
  }

  private updateStats(name: string, duration: number): void {
    // Limit memory usage by capping the number of metrics
    if (this.stats.size >= this.maxMetrics) {
      // Remove oldest entries (simple FIFO)
      const firstKey = this.stats.keys().next().value;
      if (firstKey) {
        this.stats.delete(firstKey);
      }
    }

    const existing = this.stats.get(name);
    if (existing) {
      existing.totalCalls++;
      existing.averageDuration = (existing.averageDuration * (existing.totalCalls - 1) + duration) / existing.totalCalls;
      existing.minDuration = Math.min(existing.minDuration, duration);
      existing.maxDuration = Math.max(existing.maxDuration, duration);
      existing.lastCall = Date.now();
    } else {
      this.stats.set(name, {
        totalCalls: 1,
        averageDuration: duration,
        minDuration: duration,
        maxDuration: duration,
        lastCall: Date.now(),
      });
    }
  }

  getStats(name?: string): PerformanceStats | Map<string, PerformanceStats> | null {
    if (!this.isEnabled) return null;

    if (name) {
      return this.stats.get(name) || null;
    }
    return new Map(this.stats);
  }

  clearStats(): void {
    this.stats.clear();
    this.metrics.clear();
  }

  // Helper method to measure async functions
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startTiming(name, metadata);
    try {
      const result = await fn();
      this.endTiming(name);
      return result;
    } catch (error) {
      this.endTiming(name);
      throw error;
    }
  }

  // Helper method to measure sync functions
  measure<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    this.startTiming(name, metadata);
    try {
      const result = fn();
      this.endTiming(name);
      return result;
    } catch (error) {
      this.endTiming(name);
      throw error;
    }
  }

  // Get performance summary
  getSummary(): string {
    if (!this.isEnabled || this.stats.size === 0) {
      return 'Performance monitoring is disabled or no data available';
    }

    const summary = Array.from(this.stats.entries())
      .map(([name, stats]) => {
        return `${name}: ${stats.totalCalls} calls, avg: ${stats.averageDuration.toFixed(2)}ms, min: ${stats.minDuration.toFixed(2)}ms, max: ${stats.maxDuration.toFixed(2)}ms`;
      })
      .join('\n');

    return `Performance Summary:\n${summary}`;
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  isMonitoringEnabled(): boolean {
    return this.isEnabled;
  }

  // Configure logging behavior
  setLogLevel(level: 'none' | 'slow' | 'all'): void {
    this.logLevel = level;
  }

  setLogThreshold(threshold: number): void {
    this.logThreshold = threshold;
  }

  getLogConfig(): { level: string; threshold: number } {
    return {
      level: this.logLevel,
      threshold: this.logThreshold,
    };
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  return {
    startTiming: performanceMonitor.startTiming.bind(performanceMonitor),
    endTiming: performanceMonitor.endTiming.bind(performanceMonitor),
    measure: performanceMonitor.measure.bind(performanceMonitor),
    measureAsync: performanceMonitor.measureAsync.bind(performanceMonitor),
    getStats: performanceMonitor.getStats.bind(performanceMonitor),
    getSummary: performanceMonitor.getSummary.bind(performanceMonitor),
    clearStats: performanceMonitor.clearStats.bind(performanceMonitor),
    isEnabled: performanceMonitor.isMonitoringEnabled(),
    setLogLevel: performanceMonitor.setLogLevel.bind(performanceMonitor),
    setLogThreshold: performanceMonitor.setLogThreshold.bind(performanceMonitor),
    getLogConfig: performanceMonitor.getLogConfig.bind(performanceMonitor),
  };
};

// Higher-order component for measuring component render times
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const name = componentName || Component.displayName || Component.name || 'Component';
    
    React.useEffect(() => {
      performanceMonitor.startTiming(`${name}_render`);
      return () => {
        performanceMonitor.endTiming(`${name}_render`);
      };
    });

    return React.createElement(Component as any, { ...props, ref });
  });

  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName || Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default performanceMonitor;
