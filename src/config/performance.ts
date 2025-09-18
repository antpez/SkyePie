import { performanceMonitor } from '../utils/performanceMonitor';

// Performance monitoring configuration
export const configurePerformanceLogging = () => {
  // Set default logging behavior
  // Options: 'none' | 'slow' | 'all'
  performanceMonitor.setLogLevel('slow'); // Only log slow operations by default
  
  // Set threshold for what's considered "slow" (in milliseconds)
  // Optimized for production launch - only log truly slow operations
  performanceMonitor.setLogThreshold(200); // Log operations taking more than 200ms
  
  // You can also disable logging completely in production
  if (__DEV__) {
    console.log('🔧 Performance monitoring configured:', performanceMonitor.getLogConfig());
  }
};

// Initialize performance monitoring with sensible defaults
configurePerformanceLogging();
