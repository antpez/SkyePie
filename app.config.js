import 'dotenv/config';

const getRuntimeVersion = () => {
  // Use the same version as your app version
  return "1.0.0";
};

const getChannelName = () => {
  // You can customize this based on your environment
  return process.env.EXPO_CHANNEL_NAME || "development";
};

// Get the current platform at build time
const getCurrentPlatform = () => {
  if (process.env.EXPO_PLATFORM) {
    return process.env.EXPO_PLATFORM;
  }
  
  // Try to detect platform from other environment variables
  if (process.env.EXPO_OS === 'ios') return 'ios';
  if (process.env.EXPO_OS === 'android') return 'android';
  if (process.env.EXPO_OS === 'web') return 'web';
  
  // Default fallback
  return 'ios';
};

export default {
  expo: {
    name: "SkyePie",
    slug: "skyepie",
    version: "1.0.0",
    scheme: "skyepie",
    icon: "./assets/splash-icon.png",
    plugins: [
      "expo-router"
    ],
    runtimeVersion: getRuntimeVersion(),
    assetBundlePatterns: [
      "**/*"
    ],
    splash: {
      image: "./assets/splash-icon.png",
      backgroundColor: "#ffffff",
      resizeMode: "contain",
      dark: {
        backgroundColor: "#000000"
      }
    },
    web: {
      bundler: "metro",
      icon: "./assets/iconskyepieweb.png"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.antpez.skyepie",
      icon: "./assets/icon2.icon",
      config: {
        usesNonExemptEncryption: false,
      },
      infoPlist: {
        UIAppFonts: [],
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
          NSAllowsLocalNetworking: true,
          NSExceptionDomains: {
            "api.openweathermap.org": {
              NSExceptionAllowsInsecureHTTPLoads: true,
              NSExceptionMinimumTLSVersion: "TLSv1.0",
              NSIncludesSubdomains: true
            },
            "tile.openweathermap.org": {
              NSExceptionAllowsInsecureHTTPLoads: true,
              NSExceptionMinimumTLSVersion: "TLSv1.0",
              NSIncludesSubdomains: true
            }
          }
        },
        NSLocationWhenInUseUsageDescription: "SkyePie uses your location to show local weather for your area.",
        NSLocationUsageDescription: "SkyePie needs location access to provide accurate weather information near you."
      }
    },
    android: {
      package: "com.antpez.skyepie",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      fonts: [],
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ]
    },
    updates: {
      url: "https://u.expo.dev/c2589986-dccf-4d6f-8bfb-adc2d6bca8fa",
      runtimeVersion: getRuntimeVersion(),
      requestHeaders: {
        "expo-runtime-version": getRuntimeVersion(),
        "expo-channel-name": getChannelName(),
        "expo-platform": getCurrentPlatform()
      }
    },
    // Environment variables for EAS builds
    extra: {
      ...process.env,
      eas: {
        projectId: "c2589986-dccf-4d6f-8bfb-adc2d6bca8fa"
      },
      // OpenWeatherMap API configuration
      EXPO_PUBLIC_OPENWEATHER_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || process.env.OPENWEATHERMAP_API_KEY || 'demo',
      openWeatherMapWeatherMapsEnabled: true,
      openWeatherMapFreeTierLimit: 1000, // calls per day
      // Performance optimizations
      performanceOptimizations: true,
      productionMode: process.env.NODE_ENV === 'production',
    }
  }
};
