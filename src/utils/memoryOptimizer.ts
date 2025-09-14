/**
 * Memory optimization utilities for React Native
 */

interface MemoryStats {
  used: number;
  total: number;
  percentage: number;
  timestamp: number;
}

class MemoryOptimizer {
  private memoryStats: MemoryStats[] = [];
  private readonly MAX_STATS = 100;
  private readonly MEMORY_THRESHOLD = 80; // 80% memory usage threshold
  private cleanupTasks: (() => void)[] = [];

  /**
   * Get current memory usage
   */
  getMemoryUsage(): MemoryStats {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const stats: MemoryStats = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
        timestamp: Date.now(),
      };
      
      this.recordMemoryStats(stats);
      return stats;
    }
    
    return { used: 0, total: 0, percentage: 0, timestamp: Date.now() };
  }

  /**
   * Record memory statistics
   */
  private recordMemoryStats(stats: MemoryStats): void {
    this.memoryStats.push(stats);
    
    // Keep only the last MAX_STATS entries
    if (this.memoryStats.length > this.MAX_STATS) {
      this.memoryStats = this.memoryStats.slice(-this.MAX_STATS);
    }
  }

  /**
   * Check if memory usage is high
   */
  isMemoryHigh(): boolean {
    const current = this.getMemoryUsage();
    return current.percentage > this.MEMORY_THRESHOLD;
  }

  /**
   * Get memory trend (increasing, decreasing, stable)
   */
  getMemoryTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.memoryStats.length < 3) return 'stable';
    
    const recent = this.memoryStats.slice(-3);
    const first = recent[0].percentage;
    const last = recent[recent.length - 1].percentage;
    const diff = last - first;
    
    if (diff > 5) return 'increasing';
    if (diff < -5) return 'decreasing';
    return 'stable';
  }

  /**
   * Force garbage collection (if available)
   */
  forceGarbageCollection(): void {
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }
  }

  /**
   * Register cleanup task
   */
  registerCleanupTask(task: () => void): void {
    this.cleanupTasks.push(task);
  }

  /**
   * Execute all cleanup tasks
   */
  executeCleanupTasks(): void {
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.warn('Cleanup task failed:', error);
      }
    });
    this.cleanupTasks = [];
  }

  /**
   * Clear memory caches
   */
  clearCaches(): void {
    // Clear performance monitor cache
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      performance.clearMarks();
    }
    if (typeof performance !== 'undefined' && performance.clearMeasures) {
      performance.clearMeasures();
    }
    
    // Force garbage collection
    this.forceGarbageCollection();
  }

  /**
   * Get memory statistics summary
   */
  getMemorySummary(): {
    current: MemoryStats;
    average: number;
    peak: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    isHigh: boolean;
  } {
    const current = this.getMemoryUsage();
    const average = this.memoryStats.length > 0 
      ? this.memoryStats.reduce((sum, stat) => sum + stat.percentage, 0) / this.memoryStats.length
      : 0;
    const peak = this.memoryStats.length > 0
      ? Math.max(...this.memoryStats.map(stat => stat.percentage))
      : 0;
    const trend = this.getMemoryTrend();
    const isHigh = this.isMemoryHigh();

    return {
      current,
      average,
      peak,
      trend,
      isHigh,
    };
  }

  /**
   * Monitor memory usage and trigger cleanup if needed
   */
  startMemoryMonitoring(intervalMs: number = 30000): () => void {
    const interval = setInterval(() => {
      const summary = this.getMemorySummary();
      
      if (summary.isHigh && summary.trend === 'increasing') {
        console.warn('High memory usage detected, executing cleanup tasks');
        this.executeCleanupTasks();
        this.clearCaches();
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }

  /**
   * Optimize component props to reduce memory usage
   */
  optimizeProps<T extends Record<string, any>>(props: T): T {
    const optimized: any = {};
    
    for (const [key, value] of Object.entries(props)) {
      // Skip functions and objects that might cause memory leaks
      if (typeof value === 'function' || (typeof value === 'object' && value !== null)) {
        continue;
      }
      
      // Only include primitive values
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        optimized[key] = value;
      }
    }
    
    return optimized as T;
  }

  /**
   * Create a memory-efficient debounced function
   */
  createDebouncedFunction<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): T & { cancel: () => void } {
    let timeoutId: NodeJS.Timeout | null = null;
    
    const debounced = ((...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        func(...args);
        timeoutId = null;
      }, delay);
    }) as T & { cancel: () => void };
    
    debounced.cancel = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
    
    return debounced;
  }

  /**
   * Create a memory-efficient throttled function
   */
  createThrottledFunction<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T & { cancel: () => void } {
    let inThrottle = false;
    let lastArgs: Parameters<T> | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    
    const throttled = ((...args: Parameters<T>) => {
      lastArgs = args;
      
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        
        timeoutId = setTimeout(() => {
          inThrottle = false;
          if (lastArgs) {
            func(...lastArgs);
            lastArgs = null;
          }
        }, limit);
      }
    }) as T & { cancel: () => void };
    
    throttled.cancel = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      inThrottle = false;
      lastArgs = null;
    };
    
    return throttled;
  }
}

// Create singleton instance
export const memoryOptimizer = new MemoryOptimizer();

/**
 * Hook for memory optimization
 */
export const useMemoryOptimizer = () => {
  return {
    getMemoryUsage: memoryOptimizer.getMemoryUsage.bind(memoryOptimizer),
    isMemoryHigh: memoryOptimizer.isMemoryHigh.bind(memoryOptimizer),
    getMemoryTrend: memoryOptimizer.getMemoryTrend.bind(memoryOptimizer),
    getMemorySummary: memoryOptimizer.getMemorySummary.bind(memoryOptimizer),
    registerCleanupTask: memoryOptimizer.registerCleanupTask.bind(memoryOptimizer),
    executeCleanupTasks: memoryOptimizer.executeCleanupTasks.bind(memoryOptimizer),
    clearCaches: memoryOptimizer.clearCaches.bind(memoryOptimizer),
    startMemoryMonitoring: memoryOptimizer.startMemoryMonitoring.bind(memoryOptimizer),
    optimizeProps: memoryOptimizer.optimizeProps.bind(memoryOptimizer),
    createDebouncedFunction: memoryOptimizer.createDebouncedFunction.bind(memoryOptimizer),
    createThrottledFunction: memoryOptimizer.createThrottledFunction.bind(memoryOptimizer),
  };
};

export default memoryOptimizer;
