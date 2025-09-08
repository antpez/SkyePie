const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for path mapping
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
  '@/components': path.resolve(__dirname, 'src/components'),
  '@/screens': path.resolve(__dirname, 'src/screens'),
  '@/hooks': path.resolve(__dirname, 'src/hooks'),
  '@/store': path.resolve(__dirname, 'src/store'),
  '@/services': path.resolve(__dirname, 'src/services'),
  '@/database': path.resolve(__dirname, 'src/database'),
  '@/styles': path.resolve(__dirname, 'src/styles'),
  '@/utils': path.resolve(__dirname, 'src/utils'),
  '@/types': path.resolve(__dirname, 'src/types'),
  '@/assets': path.resolve(__dirname, 'src/assets'),
  '@/config': path.resolve(__dirname, 'src/config'),
};

module.exports = config;
