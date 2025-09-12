# Performance Logging Configuration

This guide explains how to configure performance logging in the SkyePie weather app.

## 🎛️ Logging Levels

### 1. **None** - No Logging
- Disables all performance logging
- Use when you want zero console output
- Still collects metrics for the dashboard

### 2. **Slow Only** (Default)
- Only logs operations taking longer than the threshold
- Shows slow operations with 🐌 emoji
- Shows errors with ❌ emoji
- Recommended for development

### 3. **All** - Full Logging
- Logs every performance measurement
- Shows all operations with ⏱️ emoji
- Use for detailed debugging

## ⚙️ Configuration

### Default Settings
```typescript
// Set in src/config/performance.ts
performanceMonitor.setLogLevel('slow');     // Only log slow operations
performanceMonitor.setLogThreshold(100);    // 100ms threshold
```

### Runtime Configuration
```typescript
import { performanceMonitor } from './src/utils/performanceMonitor';

// Change log level
performanceMonitor.setLogLevel('none');     // Disable logging
performanceMonitor.setLogLevel('slow');     // Log slow operations only
performanceMonitor.setLogLevel('all');      // Log everything

// Change threshold for "slow" operations
performanceMonitor.setLogThreshold(50);     // 50ms threshold
performanceMonitor.setLogThreshold(200);    // 200ms threshold

// Get current configuration
const config = performanceMonitor.getLogConfig();
console.log(config); // { level: 'slow', threshold: 100 }
```

## 🎮 Performance Monitor UI

The Performance Monitor component provides a visual interface to control logging:

### Features
- **Enable/Disable Monitoring**: Toggle performance tracking
- **Log Level Control**: Switch between None, Slow Only, and All
- **Threshold Adjustment**: Set what's considered "slow"
- **Real-time Stats**: View performance metrics
- **Clear Stats**: Reset all collected data

### Usage
```typescript
import { PerformanceMonitor } from './src/components/common/PerformanceMonitor';

// Show performance monitor (development only)
<PerformanceMonitor visible={__DEV__} onClose={() => setShowMonitor(false)} />
```

## 📊 Log Examples

### Slow Operations (🐌)
```
🐌 WeatherScreen_render: 150.25ms
🐌 fetchCurrentWeather: 1200.50ms
🐌 loadFavoriteLocations: 800.75ms
```

### Errors (❌)
```
❌ WeatherService.getCurrentWeather: 5000.00ms { error: "Network timeout" }
❌ DatabaseConnection.initialize: 2000.00ms { error: "Connection failed" }
```

### Normal Operations (⏱️) - Only shown with "All" level
```
⏱️ WeatherIcon_render: 5.25ms
⏱️ ThemeProvider_render: 2.10ms
⏱️ WeatherCard_render: 8.75ms
```

## 🚀 Performance Tips

### 1. **Development Workflow**
- Start with "Slow Only" level
- Set threshold to 100ms initially
- Increase threshold if too many logs appear
- Use "All" level only for detailed debugging

### 2. **Production Settings**
- Set log level to "none" in production
- Keep monitoring enabled for metrics collection
- Use the dashboard to view performance data

### 3. **Debugging Performance Issues**
- Use "All" level to see all operations
- Lower threshold to catch more slow operations
- Focus on operations with 🐌 or ❌ emojis
- Use the performance dashboard for trends

## 🔧 Quick Configuration

### Minimal Logging (Recommended)
```typescript
performanceMonitor.setLogLevel('slow');
performanceMonitor.setLogThreshold(200);
```

### Detailed Debugging
```typescript
performanceMonitor.setLogLevel('all');
performanceMonitor.setLogThreshold(50);
```

### Production Ready
```typescript
performanceMonitor.setLogLevel('none');
// Keep monitoring enabled for dashboard
```

## 📈 Monitoring Dashboard

The Performance Monitor shows:
- **Total Calls**: Number of times each operation was called
- **Average Duration**: Mean execution time
- **Min/Max Duration**: Fastest and slowest times
- **Real-time Updates**: Live performance data

## 🎯 Best Practices

1. **Start Conservative**: Begin with "slow" level and 100ms threshold
2. **Adjust as Needed**: Increase threshold if too many logs appear
3. **Use Dashboard**: Monitor trends rather than individual logs
4. **Production Ready**: Disable logging but keep monitoring
5. **Debug Mode**: Use "all" level only when investigating issues

## 🚨 Troubleshooting

### Too Many Logs
- Increase the threshold (e.g., 200ms)
- Switch to "slow" level
- Check for performance issues

### No Logs Appearing
- Ensure monitoring is enabled
- Check if log level is set to "none"
- Verify operations are being measured

### Performance Impact
- Logging has minimal overhead
- Disable in production if concerned
- Use dashboard instead of console logs
