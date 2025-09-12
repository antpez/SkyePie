import { performanceMonitor } from '../utils/performanceMonitor';

// Performance monitoring configuration
export const configurePerformanceLogging = () => {
  // Set default logging behavior
  // Options: 'none' | 'slow' | 'all'
  performanceMonitor.setLogLevel('slow'); // Only log slow operations by default
  
  // Set threshold for what's considered "slow" (in milliseconds)
  // Lowered from 100ms to 50ms for better visibility
  performanceMonitor.setLogThreshold(50); // Log operations taking more than 50ms
  
  // You can also disable logging completely in production
  if (__DEV__) {
    console.log('🔧 Performance monitoring configured:', performanceMonitor.getLogConfig());
  }
};

// Initialize performance monitoring with sensible defaults
configurePerformanceLogging();
