import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { Text } from 'react-native-paper';
import { useThemeContext } from '../../contexts/ThemeContext';
import { typography } from '../../styles/typography';

interface UniversalHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  height?: number;
  paddingTop?: number;
}

export const UniversalHeader: React.FC<UniversalHeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightComponent,
  backgroundColor,
  textColor,
  height = 100,
  paddingTop = 50,
}) => {
  const { theme } = useThemeContext();
  
  const headerBackgroundColor = backgroundColor || theme.colors.surface;
  const headerTextColor = textColor || theme.colors.onSurface;

  return (
    <>
      <StatusBar 
        barStyle={theme.dark ? 'light-content' : 'dark-content'} 
        backgroundColor={headerBackgroundColor}
      />
      <View style={[
        styles.header,
        {
          backgroundColor: headerBackgroundColor,
          height,
          paddingTop,
        }
      ]}>
        <View style={styles.headerContent}>
          <View style={styles.leftSection}>
            {showBackButton && (
              <Text 
                style={[styles.backButton, { color: headerTextColor }]}
                onPress={onBackPress}
              >
                ← Back
              </Text>
            )}
          </View>
          
          <View style={styles.centerSection}>
            <Text 
              variant="headlineSmall" 
              style={[styles.title, { color: headerTextColor }]}
            >
              {title}
            </Text>
          </View>
          
          <View style={styles.rightSection}>
            {rightComponent}
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    ...typography.titleLarge,
    textAlign: 'center',
  },
  backButton: {
    ...typography.titleSmall,
  },
});

export default UniversalHeader;
