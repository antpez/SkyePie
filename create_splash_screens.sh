#!/bin/bash

# Create splash screen images for iOS and Android
# This script will resize your splash screen image to the required dimensions

# Source image (you'll need to replace this with your actual image)
SOURCE_IMAGE="assets/splash/Splash_Screen.png"

# Check if source image exists
if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "Error: Source image $SOURCE_IMAGE not found!"
    echo "Please place your splash screen image at $SOURCE_IMAGE"
    exit 1
fi

echo "Creating splash screen images from $SOURCE_IMAGE..."

# Create iOS splash screen (1024x1024)
echo "Creating iOS splash screen (1024x1024)..."
convert "$SOURCE_IMAGE" -resize 1024x1024^ -gravity center -extent 1024x1024 -background "#87CEEB" "assets/splash/ios_splash_1024.png"

# Create Android splash screens for different densities
echo "Creating Android splash screens..."

# mdpi (320x480)
convert "$SOURCE_IMAGE" -resize 320x480^ -gravity center -extent 320x480 -background "#87CEEB" "assets/splash/android_splash_mdpi.png"

# hdpi (480x800)
convert "$SOURCE_IMAGE" -resize 480x800^ -gravity center -extent 480x800 -background "#87CEEB" "assets/splash/android_splash_hdpi.png"

# xhdpi (720x1280)
convert "$SOURCE_IMAGE" -resize 720x1280^ -gravity center -extent 720x1280 -background "#87CEEB" "assets/splash/android_splash_xhdpi.png"

# xxhdpi (1080x1920)
convert "$SOURCE_IMAGE" -resize 1080x1920^ -gravity center -extent 1080x1920 -background "#87CEEB" "assets/splash/android_splash_xxhdpi.png"

# xxxhdpi (1440x2560)
convert "$SOURCE_IMAGE" -resize 1440x2560^ -gravity center -extent 1440x2560 -background "#87CEEB" "assets/splash/android_splash_xxxhdpi.png"

echo "Splash screen images created successfully!"
echo ""
echo "Files created:"
echo "- assets/splash/ios_splash_1024.png (iOS)"
echo "- assets/splash/android_splash_mdpi.png (Android mdpi)"
echo "- assets/splash/android_splash_hdpi.png (Android hdpi)"
echo "- assets/splash/android_splash_xhdpi.png (Android xhdpi)"
echo "- assets/splash/android_splash_xxhdpi.png (Android xxhdpi)"
echo "- assets/splash/android_splash_xxxhdpi.png (Android xxxhdpi)"
