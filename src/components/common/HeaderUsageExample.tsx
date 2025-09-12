import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UniversalHeader } from './UniversalHeader';
import { useThemeContext } from '../../contexts/ThemeContext';

// Example usage of UniversalHeader in different scenarios

export const HeaderUsageExample: React.FC = () => {
  const { theme } = useThemeContext();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Basic header */}
      <UniversalHeader title="Basic Header" />
      
      {/* Header with back button */}
      <UniversalHeader 
        title="With Back Button" 
        showBackButton={true}
        onBackPress={() => console.log('Back pressed')}
      />
      
      {/* Transparent header */}
      <UniversalHeader 
        title="Transparent Header" 
        backgroundColor="transparent"
        textColor={theme.colors.onSurface}
      />
      
      {/* Custom height header */}
      <UniversalHeader 
        title="Custom Height" 
        height={80}
        paddingTop={40}
      />
      
      {/* Header with right component */}
      <UniversalHeader 
        title="With Right Component"
        rightComponent={<Text>Settings</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
