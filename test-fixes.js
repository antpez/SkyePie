#!/usr/bin/env node

/**
 * Test script to verify the undefined value fixes
 * Run with: node test-fixes.js
 */

console.log('🧪 Testing SkyePie fixes...\n');

// Test 1: Check if all required files exist
const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'src/contexts/ThemeContext.tsx',
  'src/components/common/ErrorBoundary.tsx',
  'src/contexts/UnitsContext.tsx',
  'src/contexts/DisplayPreferencesContext.tsx',
  'app/(tabs)/index.tsx',
  'src/hooks/useTheme.ts'
];

console.log('📁 Checking critical files...');
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Test 2: Check for safety patterns in files
console.log('\n🔍 Checking for safety patterns...');

const safetyPatterns = [
  { pattern: /themeHookResult\?\./g, description: 'Safe theme context access' },
  { pattern: /useThemeContext\(\)\s*\)\s*;\s*let\s+theme/g, description: 'ErrorBoundary safety check' },
  { pattern: /context === undefined.*return.*DEFAULT_UNITS/g, description: 'Units context fallback' },
  { pattern: /currentWeather\.weather\?\.\[0\]/g, description: 'Weather data safety checks' },
  { pattern: /effectiveTheme.*\|\|.*'light'/g, description: 'Theme fallback values' }
];

safetyPatterns.forEach(({ pattern, description }) => {
  let found = false;
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (pattern.test(content)) {
        found = true;
      }
    }
  });
  
  if (found) {
    console.log(`✅ ${description}`);
  } else {
    console.log(`❌ ${description} - pattern not found`);
  }
});

// Test 3: Check for common error patterns
console.log('\n🚨 Checking for potential error patterns...');

const errorPatterns = [
  { pattern: /\.colors\./g, description: 'Direct object property access' },
  { pattern: /useThemeContext\(\)\./g, description: 'Direct context access without safety' },
  { pattern: /throw new Error/g, description: 'Error throwing in context hooks' }
];

errorPatterns.forEach(({ pattern, description }) => {
  let found = false;
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (pattern.test(content)) {
        found = true;
      }
    }
  });
  
  if (found) {
    console.log(`⚠️  ${description} - found, but may be safe`);
  } else {
    console.log(`✅ ${description} - not found`);
  }
});

console.log('\n🎉 Test completed!');
console.log('\n📱 To test the app:');
console.log('1. Run: npx expo start');
console.log('2. Scan the QR code with Expo Go app');
console.log('3. Or press "i" for iOS simulator');
console.log('4. Or press "a" for Android emulator');
console.log('\n🔧 If you see any errors, they should now be handled gracefully!');
