/**
 * Weather icon mapping utility
 * Maps OpenWeatherMap icon codes to custom weather icon assets
 */

// Import all weather icons statically
const weatherIcons = {
  'clear_night.png': require('../../assets/images/weather-icons/clear_night.png'),
  'clearing.png': require('../../assets/images/weather-icons/clearing.png'),
  'cloudy_night_full.png': require('../../assets/images/weather-icons/cloudy_night_full.png'),
  'cloudy_night_half.png': require('../../assets/images/weather-icons/cloudy_night_half.png'),
  'cloudy.png': require('../../assets/images/weather-icons/cloudy.png'),
  'cloudy1.png': require('../../assets/images/weather-icons/cloudy1.png'),
  'danger.png': require('../../assets/images/weather-icons/danger.png'),
  'evening.png': require('../../assets/images/weather-icons/evening.png'),
  'extreme_heat.png': require('../../assets/images/weather-icons/extreme_heat.png'),
  'full_clear_night.png': require('../../assets/images/weather-icons/full_clear_night.png'),
  'full_moon.png': require('../../assets/images/weather-icons/full_moon.png'),
  'half_moon.png': require('../../assets/images/weather-icons/half_moon.png'),
  'heavy_storm.png': require('../../assets/images/weather-icons/heavy_storm.png'),
  'light_cloudy.png': require('../../assets/images/weather-icons/light_cloudy.png'),
  'light_rain.png': require('../../assets/images/weather-icons/light_rain.png'),
  'partly_cloudy.png': require('../../assets/images/weather-icons/partly_cloudy.png'),
  'rain_passing.png': require('../../assets/images/weather-icons/rain_passing.png'),
  'rain.png': require('../../assets/images/weather-icons/rain.png'),
  'storm1.png': require('../../assets/images/weather-icons/storm1.png'),
  'sunny.png': require('../../assets/images/weather-icons/sunny.png'),
  'sunrise.png': require('../../assets/images/weather-icons/sunrise.png'),
  'sunset.png': require('../../assets/images/weather-icons/sunset.png'),
  'very_hot.png': require('../../assets/images/weather-icons/very_hot.png'),
  'very_windy.png': require('../../assets/images/weather-icons/very_windy.png'),
  'windy.png': require('../../assets/images/weather-icons/windy.png'),
};

// Debug: Log what the require statements are returning
console.log('WeatherIcons debug:', {
  'clear_night.png': weatherIcons['clear_night.png'],
  'sunny.png': weatherIcons['sunny.png'],
  'cloudy_night_half.png': weatherIcons['cloudy_night_half.png'],
});

export interface WeatherIconMapping {
  [key: string]: string;
}

// Map OpenWeatherMap icon codes to custom weather icon filenames
export const WEATHER_ICON_MAPPING: WeatherIconMapping = {
  // Clear sky
  '01d': 'sunny.png',           // clear sky day
  '01n': 'clear_night.png',     // clear sky night
  
  // Few clouds
  '02d': 'partly_cloudy.png',   // few clouds day
  '02n': 'cloudy_night_half.png', // few clouds night
  
  // Scattered clouds
  '03d': 'light_cloudy.png',    // scattered clouds day
  '03n': 'cloudy_night_half.png', // scattered clouds night
  
  // Broken clouds
  '04d': 'cloudy.png',          // broken clouds day
  '04n': 'cloudy_night_full.png', // broken clouds night
  
  // Shower rain
  '09d': 'light_rain.png',      // shower rain day
  '09n': 'light_rain.png',      // shower rain night
  
  // Rain
  '10d': 'rain.png',            // rain day
  '10n': 'rain.png',            // rain night
  
  // Thunderstorm
  '11d': 'heavy_storm.png',     // thunderstorm day
  '11n': 'heavy_storm.png',     // thunderstorm night
  
  // Snow
  '13d': 'storm1.png',          // snow day (using storm icon as placeholder)
  '13n': 'storm1.png',          // snow night (using storm icon as placeholder)
  
  // Mist
  '50d': 'windy.png',           // mist day
  '50n': 'windy.png',           // mist night
};

/**
 * Get the custom weather icon filename for a given OpenWeatherMap icon code
 * @param iconCode - OpenWeatherMap icon code (e.g., '01d', '02n')
 * @returns The filename of the custom weather icon
 */
export const getWeatherIconFilename = (iconCode: string | undefined | null): string => {
  if (!iconCode) {
    return 'sunny.png'; // Default to sunny if no icon code provided
  }
  return WEATHER_ICON_MAPPING[iconCode] || 'sunny.png'; // Default to sunny if not found
};

/**
 * Get the weather icon asset for a given OpenWeatherMap icon code
 * @param iconCode - OpenWeatherMap icon code
 * @returns The weather icon asset
 */
export const getWeatherIconPath = (iconCode: string | undefined | null): any => {
  if (!iconCode) {
    console.log('getWeatherIconPath: No icon code, using sunny.png');
    return weatherIcons['sunny.png']; // Default to sunny if no icon code provided
  }
  
  const filename = getWeatherIconFilename(iconCode);
  console.log(`getWeatherIconPath: Looking for filename: ${filename}`);
  
  const iconAsset = weatherIcons[filename as keyof typeof weatherIcons];
  console.log(`getWeatherIconPath: Found asset:`, iconAsset, 'type:', typeof iconAsset);
  
  if (!iconAsset) {
    console.warn(`WeatherIcon: Icon asset not found for filename: ${filename}, using sunny.png as fallback`);
    return weatherIcons['sunny.png'];
  }
  
  return iconAsset;
};
