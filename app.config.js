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
    icon: "./assets/icon-1757816287706-2.png",
    plugins: [
      "expo-router"
    ],
    runtimeVersion: getRuntimeVersion(),
    assetBundlePatterns: [
      "**/*"
    ],
    splash: {
      image: "./assets/splash-icon.png",
      backgroundColor: "#000000",
      resizeMode: "contain"
    },
    web: {
      bundler: "metro",
      icon: "./assets/iconskyepieweb.png"
    },
    ios: {
      bundleIdentifier: "com.antpez.skyepie",
      icon: "./assets/iconskyepieios.png"
    },
    android: {
      package: "com.antpez.skyepie",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
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
    }
  }
};
