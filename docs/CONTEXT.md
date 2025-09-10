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

## 🌟 Unique Features to Make SkyePie Stand Out

### **1. AI-Powered Weather Insights & Recommendations**
- **Smart Clothing Suggestions**: "Wear a light jacket and bring an umbrella" based on current conditions
- **Activity Recommendations**: "Perfect weather for hiking" or "Stay indoors, air quality is poor"
- **Personalized Weather Patterns**: Learn user preferences and suggest optimal times for outdoor activities

### **2. Hyperlocal Micro-Weather**
- **Real-Time Crowd-Sourced Data**: Users can report current conditions in their exact location
- **Traffic-Weather Integration**: Show how weather affects traffic patterns

### **3. Weather Photography & Social Features**
- **Weather Photo Sharing**: Users can share photos of current weather conditions
- **Community Weather Reports**: See what weather looks like from other users' perspectives

### **4. Advanced Health & Wellness Integration**
- **Allergy & Pollen Tracking**: Detailed pollen counts and allergy forecasts
- **UV Index with Skin Protection**: Personalized sun protection recommendations
- **Air Quality Health Alerts**: Detailed breakdown of pollutants and health impacts
- **Weather-Related Health Tips**: "High humidity - stay hydrated" notifications

### **5. Gamification & Weather Learning**
- **Weather Prediction Game**: Users guess tomorrow's weather, earn points
- **Weather Education**: Learn about different weather phenomena with interactive content
- **Weather Streaks**: Track consecutive days of accurate personal weather predictions
- **Achievement System**: Unlock badges for weather-related milestones

### **6. Smart Home & IoT Integration**
- **Smart Thermostat Control**: Automatically adjust home temperature based on weather
- **Garden Care Alerts**: "Water your plants - no rain expected for 3 days"
- **Outdoor Equipment Alerts**: "Cover your grill - rain in 2 hours"
- **Energy Usage Optimization**: Suggest when to use appliances based on weather

### **7. Advanced Visualization Features**
- **3D Weather Visualization**: Rotate and explore weather patterns in 3D
- **Weather Animation Timeline**: Animate weather changes over time
- **Augmented Reality Weather**: Point phone at sky to see weather data overlay
- **Weather Soundscapes**: Ambient sounds that match current weather conditions

### **8. Travel & Location Intelligence**
- **Weather-Based Travel Planning**: "Best time to visit Paris is next week"
- **Multi-City Weather Dashboard**: Track weather across multiple travel destinations
- **Weather Impact on Flights**: Show how weather affects flight delays
- **Packing Assistant**: Generate packing lists based on destination weather

### **9. Unique Data Sources & Predictions**
- **Satellite Imagery Analysis**: Show real satellite images with weather overlay
- **Weather Pattern Recognition**: Identify and explain unusual weather patterns
- **Seasonal Trend Analysis**: "This is the warmest March in 10 years"
- **Weather History Explorer**: Compare current weather to historical data

### **10. Accessibility & Inclusivity Features**
- **Voice Weather Reports**: Natural language weather descriptions
- **Haptic Weather Alerts**: Different vibration patterns for different weather types
- **Colorblind-Friendly Visualizations**: Alternative color schemes for weather maps
- **Simplified Language Mode**: Weather in plain, easy-to-understand terms

---

## 🎯 Implementation Priority Roadmap

### **Phase 1: Quick Wins (1-2 months)**
1. **AI-powered clothing suggestions** - Simple recommendation engine
2. **Weather photography sharing** - Basic photo upload and sharing
3. **Enhanced health integration** - UV index, allergy tracking
4. **Weather prediction game** - Simple guessing game with points

### **Phase 2: Medium Effort (3-6 months)**
1. **Micro-weather features** - Neighborhood-specific conditions
2. **Smart home integration** - Basic IoT device connections
3. **Advanced visualizations** - 3D weather, animations
4. **Travel planning features** - Multi-city dashboard, packing assistant

### **Phase 3: Advanced Features (6+ months)**
1. **AR weather features** - Camera-based weather overlay
2. **Community features** - Social sharing, challenges
3. **Advanced AI insights** - Mood analysis, pattern recognition
4. **IoT ecosystem** - Full smart home integration

---

## 💡 Unique Selling Points & Positioning

### **Primary Positioning Options:**
- **"The Weather App That Cares About You"** - Focus on health, wellness, and personal recommendations
- **"Weather Made Social"** - Community-driven weather insights and sharing
- **"Smart Weather for Smart Living"** - Integration with IoT and smart home devices
- **"Weather Education & Fun"** - Gamified learning about weather phenomena

### **Target User Personas:**
1. **Health-Conscious Users**: Want weather data that impacts their health decisions
2. **Tech Enthusiasts**: Love smart home integration and advanced features
3. **Social Users**: Enjoy sharing and community features
4. **Weather Enthusiasts**: Want to learn and understand weather patterns
5. **Travelers**: Need comprehensive travel weather planning

### **Competitive Advantages:**
- **Personalization**: AI-driven recommendations tailored to individual users
- **Community**: Social features that create user engagement and retention
- **Integration**: Smart home and IoT connectivity for modern living
- **Education**: Gamified learning that makes weather interesting
- **Accessibility**: Features that make weather accessible to everyone

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
