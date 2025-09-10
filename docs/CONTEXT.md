# Weather App - Product Flow & Features

## 📱 Overview

This weather app provides users with a **clean, minimal interface** to quickly view the current weather and forecast for their location. The goal is to reduce clutter and make it simple to check conditions at a glance.

---

## 🛠️ Tech Stack

**Frontend:** React Native with TypeScript, Expo, and Expo Router  
**Backend:** Node.js with Express.js and TypeScript  
**Database:** SQLite (local) + PostgreSQL (production)  
**UI Framework:** React Native Paper  
**State Management:** Redux Toolkit + RTK Query  
**API Integration:** Axios with OpenWeatherMap API

## 🚀 App Flow

### 1. Launch Screen
- On app open, the user immediately sees the **current weather** for their location
- **Location permissions enabled:**
  - App detects the device's current location
  - Automatically displays current weather and forecast for that location
- **Location permissions not enabled:**
  - User is prompted to either **enable location access** or **enter a location manually**

### 2. Main Weather Screen
This is the **core screen** users see most often.

#### Layout Structure

**🔍 Top Section**
- Search field with placeholder: *"Enter city or location"*
- Search supports autocomplete and remembers recent searches

**🌤️ Center Section**
- Current weather condition (icon + text, e.g., ☀️ "Sunny")
- Current temperature displayed prominently below the weather condition
- Optional: Feels-like temperature, humidity, or wind speed (can be toggled in settings)

**📅 Bottom Section**
- **7-Day Forecast Row**
  - Horizontal scrollable row
  - Each day shows:
    - Day of the week (e.g., Mon, Tue)
    - Weather icon (e.g., 🌧️, ☀️, ⛅)
    - High / low temperature

### 3. Search & Location Handling
- Users can tap into the **search field** to:
  - Enter a city, town, or zip code
  - See autocomplete suggestions
  - Select a location to view its weather
- Recent searches appear below the field for quick access

### 4. Permissions & Location Services
- **On first launch:**
  - App requests **location permission**
  - If denied, user is redirected to manual search mode
- **Location detection uses:**
  - Device GPS
  - Or fallback to IP-based location

---

## ⚙️ Additional Features

### Core Functionality
- **Swipe to refresh**: Users can pull down to refresh weather data
- **Light/Dark mode**: The interface adapts to system theme

### Error Handling
- **Network unavailable** → show cached last known weather + message
- **Location not found** → show friendly error + allow re-entry

---

## 🔌 Data Sources & API

### Requirements
The app requires a reliable weather API (e.g., OpenWeather, WeatherAPI, AccuWeather)

### API Capabilities
Must support:
- Current conditions
- 7-day forecast
- Search by city/coordinates

---

## 🎯 UX Goals

- **Clean & minimal design**: no clutter, focus on weather and temperature
- **Quick glance information**: users shouldn't have to scroll or dig for current weather
- **Simple search**: ability to quickly switch between multiple locations

---

## 🔮 Future Enhancements (Optional)

### Phase 2 Features
- Hourly forecast view (toggle from main screen)
- Saved locations list for fast switching
- Widgets for home screen
- Notifications for severe weather alerts

### Phase 3 Features
- Weather maps integration
- Air quality index
- UV index and sun protection recommendations
- Weather-based activity suggestions

---

## 📋 Technical Considerations

### Performance
- Efficient data caching for offline functionality
- Optimized API calls to minimize battery usage
- Smooth animations and transitions

### Accessibility
- VoiceOver support for screen readers
- High contrast mode support
- Dynamic type support for text sizing

### Platform Support
- iOS native app
- Responsive design for different screen sizes
- Support for iOS 14.0+

---

## 🗄️ Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  preferences JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true
);
```

#### Locations Table
```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  timezone VARCHAR(100),
  is_current BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  search_count INTEGER DEFAULT 0,
  last_searched TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, latitude, longitude)
);
```

#### Weather Cache Table
```sql
CREATE TABLE weather_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  weather_type VARCHAR(20) NOT NULL, -- 'current', 'forecast', 'hourly'
  data JSONB NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(location_id, weather_type)
);

CREATE INDEX idx_weather_cache_expires ON weather_cache(expires_at);
CREATE INDEX idx_weather_cache_location ON weather_cache(location_id);
```

#### Search History Table
```sql
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query VARCHAR(255) NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  search_type VARCHAR(20) DEFAULT 'manual', -- 'manual', 'gps', 'suggestion'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_history_created ON search_history(created_at DESC);
```

#### User Settings Table
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  temperature_unit VARCHAR(10) DEFAULT 'celsius', -- 'celsius', 'fahrenheit'
  wind_speed_unit VARCHAR(10) DEFAULT 'kmh', -- 'kmh', 'mph', 'ms'
  pressure_unit VARCHAR(10) DEFAULT 'hpa', -- 'hpa', 'in', 'mb'
  distance_unit VARCHAR(10) DEFAULT 'km', -- 'km', 'miles'
  theme VARCHAR(10) DEFAULT 'system', -- 'light', 'dark', 'system'
  notifications_enabled BOOLEAN DEFAULT true,
  location_accuracy VARCHAR(20) DEFAULT 'high', -- 'high', 'medium', 'low'
  auto_refresh_interval INTEGER DEFAULT 15, -- minutes
  show_feels_like BOOLEAN DEFAULT true,
  show_humidity BOOLEAN DEFAULT true,
  show_wind_speed BOOLEAN DEFAULT true,
  show_pressure BOOLEAN DEFAULT false,
  show_uv_index BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Weather Alerts Table
```sql
CREATE TABLE weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'severe_weather', 'temperature', 'wind', 'precipitation'
  severity VARCHAR(20) NOT NULL, -- 'low', 'moderate', 'high', 'extreme'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_weather_alerts_location ON weather_alerts(location_id);
CREATE INDEX idx_weather_alerts_active ON weather_alerts(is_active, end_time);
```

### Indexes for Performance
```sql
-- Composite indexes for common queries
CREATE INDEX idx_locations_user_current ON locations(user_id, is_current) WHERE is_current = true;
CREATE INDEX idx_locations_user_favorites ON locations(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_weather_cache_location_type ON weather_cache(location_id, weather_type);

-- Full-text search for location names
CREATE INDEX idx_locations_search ON locations USING gin(to_tsvector('english', name || ' ' || country || ' ' || COALESCE(state, '')));
```

---

## 📁 Optimal Folder Structure

```
skyepie/
├── 📱 app/                          # Expo Router app directory
│   ├── (auth)/                      # Auth group
│   │   ├── _layout.tsx             # Auth layout wrapper
│   │   └── permissions.tsx         # Location permissions screen
│   ├── (tabs)/                      # Main app tabs
│   │   ├── _layout.tsx             # Tab navigator layout
│   │   ├── index.tsx               # Home/Weather screen
│   │   ├── search.tsx              # Search screen
│   │   └── settings.tsx            # Settings screen
│   ├── +html.tsx                   # Web HTML template
│   ├── +not-found.tsx              # 404 screen
│   └── _layout.tsx                 # Root layout
│
├── 📦 src/                          # Source code
│   ├── 🎨 components/              # Reusable UI components
│   │   ├── common/                 # Generic components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── index.ts
│   │   ├── weather/                # Weather-specific components
│   │   │   ├── WeatherCard.tsx
│   │   │   ├── WeatherIcon.tsx
│   │   │   ├── TemperatureDisplay.tsx
│   │   │   ├── ForecastRow.tsx
│   │   │   ├── WeatherDetails.tsx
│   │   │   └── index.ts
│   │   ├── location/               # Location components
│   │   │   ├── LocationSearch.tsx
│   │   │   ├── LocationCard.tsx
│   │   │   ├── LocationPermission.tsx
│   │   │   └── index.ts
│   │   └── forms/                  # Form components
│   │       ├── SearchInput.tsx
│   │       ├── SettingsForm.tsx
│   │       └── index.ts
│   │
│   ├── 🎯 screens/                 # Screen components
│   │   ├── WeatherScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── PermissionScreen.tsx
│   │   └── index.ts
│   │
│   ├── 🧠 hooks/                   # Custom React hooks
│   │   ├── useWeather.ts
│   │   ├── useLocation.ts
│   │   ├── usePermissions.ts
│   │   ├── useTheme.ts
│   │   ├── useOffline.ts
│   │   └── index.ts
│   │
│   ├── 🗃️ store/                   # Redux store
│   │   ├── index.ts                # Store configuration
│   │   ├── slices/                 # Redux slices
│   │   │   ├── weatherSlice.ts
│   │   │   ├── locationSlice.ts
│   │   │   ├── settingsSlice.ts
│   │   │   ├── authSlice.ts
│   │   │   └── index.ts
│   │   └── api/                    # RTK Query API
│   │       ├── weatherApi.ts
│   │       ├── locationApi.ts
│   │       └── index.ts
│   │
│   ├── 🛠️ services/                # External services
│   │   ├── weatherService.ts       # Weather API integration
│   │   ├── locationService.ts      # Location services
│   │   ├── storageService.ts       # AsyncStorage wrapper
│   │   ├── notificationService.ts  # Push notifications
│   │   └── index.ts
│   │
│   ├── 🗄️ database/                # Database layer
│   │   ├── connection.ts           # Database connection
│   │   ├── migrations/             # Database migrations
│   │   │   ├── 001_initial.sql
│   │   │   ├── 002_add_alerts.sql
│   │   │   └── index.ts
│   │   ├── models/                 # Data models
│   │   │   ├── User.ts
│   │   │   ├── Location.ts
│   │   │   ├── Weather.ts
│   │   │   └── index.ts
│   │   ├── repositories/           # Data access layer
│   │   │   ├── userRepository.ts
│   │   │   ├── locationRepository.ts
│   │   │   ├── weatherRepository.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── 🎨 styles/                  # Styling
│   │   ├── theme.ts                # App theme configuration
│   │   ├── colors.ts               # Color palette
│   │   ├── typography.ts           # Font styles
│   │   ├── spacing.ts              # Spacing constants
│   │   ├── components/             # Component-specific styles
│   │   │   ├── weatherStyles.ts
│   │   │   ├── locationStyles.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── 🧪 utils/                   # Utility functions
│   │   ├── formatters.ts           # Data formatting utilities
│   │   ├── validators.ts           # Input validation
│   │   ├── constants.ts            # App constants
│   │   ├── helpers.ts              # General helper functions
│   │   ├── dateUtils.ts            # Date/time utilities
│   │   └── index.ts
│   │
│   ├── 🧪 types/                   # TypeScript type definitions
│   │   ├── weather.ts              # Weather-related types
│   │   ├── location.ts             # Location-related types
│   │   ├── user.ts                 # User-related types
│   │   ├── api.ts                  # API response types
│   │   ├── navigation.ts           # Navigation types
│   │   └── index.ts
│   │
│   └── 📱 assets/                  # Static assets
│       ├── images/                 # Image assets
│       │   ├── weather-icons/      # Weather condition icons
│       │   ├── backgrounds/        # Background images
│       │   └── logos/              # App logos
│       ├── fonts/                  # Custom fonts
│       └── data/                   # Static data files
│           ├── countries.json
│           └── timezones.json
│
├── 🧪 __tests__/                   # Test files
│   ├── components/                 # Component tests
│   ├── screens/                    # Screen tests
│   ├── services/                   # Service tests
│   ├── utils/                      # Utility tests
│   ├── __mocks__/                  # Test mocks
│   └── setup.ts                    # Test setup
│
├── 📚 docs/                        # Documentation
│   ├── CONTEXT.md                  # This file
│   ├── API.md                      # API documentation
│   ├── DEPLOYMENT.md               # Deployment guide
│   └── CONTRIBUTING.md             # Contribution guidelines
│
├── 🔧 Configuration Files
├── .env.example                    # Environment variables template
├── .env.local                      # Local environment variables
├── .gitignore                      # Git ignore rules
├── .eslintrc.js                    # ESLint configuration
├── .prettierrc                     # Prettier configuration
├── babel.config.js                 # Babel configuration
├── metro.config.js                 # Metro bundler configuration
├── app.json                        # Expo configuration
├── expo-env.d.ts                   # Expo TypeScript definitions
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── jest.config.js                  # Jest testing configuration
└── README.md                       # Project README
```

### Key Architecture Decisions

#### 🎯 **Expo Router Structure**
- Uses file-based routing with groups for better organization
- Auth group handles permission flows
- Tabs group contains main app screens

#### 🗃️ **Database Strategy**
- SQLite for local storage (offline-first approach)
- PostgreSQL for production/cloud sync
- Repository pattern for clean data access

#### 🧠 **State Management**
- Redux Toolkit for global state
- RTK Query for API caching and synchronization
- Local state with React hooks for component-specific state

#### 🎨 **Styling Approach**
- React Native Paper for consistent Material Design
- Centralized theme system
- Component-specific style files for complex components

#### 🧪 **Testing Strategy**
- Jest for unit and integration tests
- React Native Testing Library for component tests
- Mock services for API testing
