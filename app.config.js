import 'dotenv/config';

export default {
  expo: {
    name: "SkyePie",
    slug: "skyepie",
    version: "1.0.0",
    plugins: [
      "expo-router"
    ],
    extra: {
      eas: {
        projectId: "c2589986-dccf-4d6f-8bfb-adc2d6bca8fa"
      }
    },
    assetBundlePatterns: [
      "**/*"
    ],
    web: {
      bundler: "metro"
    },
    android: {
      package: "com.antpez.skyepie",
      icon: "./assets/android/mipmap-mdpi/Skyepie.png",
      adaptiveIcon: {
        foregroundImage: "./assets/android/mipmap-mdpi/Skyepie.png",
        backgroundColor: "#ffffff"
      },
      splash: {
        image: "./assets/splash/android_splash_xxhdpi.png",
        resizeMode: "contain",
        backgroundColor: "#87CEEB"
      },
      runtimeVersion: {
        policy: "appVersion"
      },
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION"
      ]
    },
    ios: {
      bundleIdentifier: "com.antpez.skyepie",
      icon: "./assets/iOS/1024.png",
      splash: {
        image: "./assets/splash/ios_splash_1024.png",
        resizeMode: "contain",
        backgroundColor: "#87CEEB"
      },
      runtimeVersion: "1.0.0",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "This app needs access to location to provide weather information for your current area.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "This app needs access to location to provide weather information for your current area.",
        NSLocationAlwaysUsageDescription: "This app needs access to location to provide weather information for your current area."
      }
    },
    updates: {
      url: "https://u.expo.dev/c2589986-dccf-4d6f-8bfb-adc2d6bca8fa"
    },
    // Environment variables for EAS builds
    extra: {
      ...process.env,
      eas: {
        projectId: "c2589986-dccf-4d6f-8bfb-adc2d6bca8fa"
      }
    }
  }
};
