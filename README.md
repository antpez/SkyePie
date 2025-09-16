# SkyePie Weather App

A clean, minimal weather app built with React Native, Expo, and TypeScript.

## Features

- 🌤️ Current weather conditions
- 📅 7-day forecast
- 🔍 Location search
- 📍 GPS location detection
- 🌙 Dark/Light theme support
- ⚙️ Customizable units and display options
- 📱 Offline support with caching

## Tech Stack

- **Frontend**: React Native with TypeScript, Expo, and Expo Router
- **UI Framework**: React Native Paper
- **State Management**: Redux Toolkit
- **Location Services**: Expo Location
- **Weather API**: OpenWeatherMap
- **Storage**: AsyncStorage

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SkyePie
```

2. Install dependencies:
```bash
npm install
```

3. Get an OpenWeatherMap API key:
   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Generate an API key

4. Configure the API key:
   - Open `.env file`
   - Replace `'your_api_key_here'` with your actual API key
   - Or set the environment variable `EXPO_PUBLIC_OPENWEATHER_API_KEY`

## Running the App

1. Start the development server:
```bash
npm start
```

2. Run on your preferred platform:
   - **iOS**: Press `i` in the terminal or scan the QR code with your iPhone
   - **Android**: Press `a` in the terminal or scan the QR code with your Android device
   - **Web**: Press `w` in the terminal

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components
│   ├── weather/        # Weather-specific components
│   └── location/       # Location-related components
├── hooks/              # Custom React hooks
├── services/           # External services (API, storage)
├── store/              # Redux store and slices
├── styles/             # Theme and styling
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── config/             # App configuration
```

## Key Components

- **WeatherCard**: Displays current weather conditions
- **ForecastRow**: Shows 7-day forecast in a horizontal scroll
- **LocationSearch**: Handles location search and autocomplete
- **LocationPermission**: Manages location permission requests

## Features Implementation

### Weather Data
- Fetches current weather and forecast from OpenWeatherMap API
- Caches data locally for offline access
- Supports metric and imperial units

### Location Services
- GPS location detection
- Location permission handling
- Reverse geocoding for location names
- Search functionality for cities worldwide

### Theme Support
- Light and dark themes
- System theme detection
- Smooth theme transitions

### Offline Support
- Caches weather data locally
- Shows last known weather when offline
- Graceful error handling

## Configuration

The app can be configured through `src/config/app.ts`:

- API endpoints
- Cache timeouts
- Default location
- App settings

## Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here
```

## Building for Production

1. Build for iOS:
```bash
npx expo build:ios
```

2. Build for Android:
```bash
npx expo build:android
```

3. Build for Web:
```bash
npx expo export -p web
```

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.
