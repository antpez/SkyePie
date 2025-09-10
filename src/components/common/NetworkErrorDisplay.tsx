import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, IconButton } from 'react-native-paper';
import { useThemeContext } from '../../contexts/ThemeContext';
import { NetworkError } from '../../types/networkErrors';

interface NetworkErrorDisplayProps {
  error: NetworkError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  compact?: boolean;
}

export const NetworkErrorDisplay: React.FC<NetworkErrorDisplayProps> = memo(({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  compact = false,
}) => {
  const { theme } = useThemeContext();

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'CONNECTION_ERROR':
        return 'wifi-off';
      case 'TIMEOUT_ERROR':
        return 'clock-alert';
      case 'RATE_LIMIT_ERROR':
        return 'clock-fast';
      case 'SERVER_ERROR':
        return 'server-network-off';
      case 'AUTHENTICATION_ERROR':
        return 'key-off';
      case 'PERMISSION_ERROR':
        return 'lock-off';
      case 'NOT_FOUND_ERROR':
        return 'magnify-remove';
      case 'VALIDATION_ERROR':
        return 'alert-circle';
      default:
        return 'alert-circle';
    }
  };

  const getErrorColor = (type: string) => {
    switch (type) {
      case 'CONNECTION_ERROR':
      case 'TIMEOUT_ERROR':
        return '#FF9800'; // Orange
      case 'RATE_LIMIT_ERROR':
        return '#FF5722'; // Deep Orange
      case 'SERVER_ERROR':
        return '#F44336'; // Red
      case 'AUTHENTICATION_ERROR':
      case 'PERMISSION_ERROR':
        return '#9C27B0'; // Purple
      case 'NOT_FOUND_ERROR':
        return '#607D8B'; // Blue Grey
      case 'VALIDATION_ERROR':
        return '#FFC107'; // Amber
      default:
        return '#757575'; // Grey
    }
  };

  const getRetryMessage = () => {
    if (error.retryAfter) {
      const minutes = Math.ceil(error.retryAfter / 60);
      return `Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before retrying.`;
    }
    
    if (error.retryable) {
      return 'You can try again in a moment.';
    }
    
    return 'Please check your internet connection and try again.';
  };

  const getErrorTitle = () => {
    switch (error.type) {
      case 'CONNECTION_ERROR':
        return 'Connection Problem';
      case 'TIMEOUT_ERROR':
        return 'Request Timeout';
      case 'RATE_LIMIT_ERROR':
        return 'Rate Limit Exceeded';
      case 'SERVER_ERROR':
        return 'Server Error';
      case 'AUTHENTICATION_ERROR':
        return 'Authentication Failed';
      case 'PERMISSION_ERROR':
        return 'Permission Denied';
      case 'NOT_FOUND_ERROR':
        return 'Not Found';
      case 'VALIDATION_ERROR':
        return 'Invalid Request';
      default:
        return 'Network Error';
    }
  };

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: theme.colors.errorContainer }]}>
        <IconButton
          icon={getErrorIcon(error.type)}
          iconColor={getErrorColor(error.type)}
          size={16}
        />
        <Text 
          variant="bodySmall" 
          style={[styles.compactText, { color: theme.colors.onErrorContainer }]}
          numberOfLines={1}
        >
          {error.message}
        </Text>
        {onRetry && error.retryable && (
          <IconButton
            icon="refresh"
            iconColor={theme.colors.onErrorContainer}
            size={16}
            onPress={onRetry}
          />
        )}
      </View>
    );
  }

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.errorContainer }]}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <IconButton
            icon={getErrorIcon(error.type)}
            iconColor={getErrorColor(error.type)}
            size={24}
          />
          <View style={styles.headerText}>
            <Text 
              variant="titleMedium" 
              style={[styles.title, { color: theme.colors.onErrorContainer }]}
            >
              {getErrorTitle()}
            </Text>
            <Text 
              variant="bodySmall" 
              style={[styles.subtitle, { color: theme.colors.onErrorContainer }]}
            >
              {error.type.replace('_', ' ').toLowerCase()}
            </Text>
          </View>
          {onDismiss && (
            <IconButton
              icon="close"
              iconColor={theme.colors.onErrorContainer}
              size={20}
              onPress={onDismiss}
            />
          )}
        </View>

        <Text 
          variant="bodyMedium" 
          style={[styles.message, { color: theme.colors.onErrorContainer }]}
        >
          {error.message}
        </Text>

        {showDetails && error.details && (
          <View style={styles.detailsContainer}>
            <Text 
              variant="bodySmall" 
              style={[styles.detailsLabel, { color: theme.colors.onErrorContainer }]}
            >
              Error Details:
            </Text>
            <Text 
              variant="bodySmall" 
              style={[styles.detailsText, { color: theme.colors.onErrorContainer }]}
            >
              {JSON.stringify(error.details, null, 2)}
            </Text>
          </View>
        )}

        <Text 
          variant="bodySmall" 
          style={[styles.retryMessage, { color: theme.colors.onErrorContainer }]}
        >
          {getRetryMessage()}
        </Text>

        <View style={styles.actions}>
          {onRetry && error.retryable && (
            <Button
              mode="contained"
              onPress={onRetry}
              style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
              labelStyle={{ color: theme.colors.onPrimary }}
            >
              Try Again
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  content: {
    padding: 16,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  compactText: {
    flex: 1,
    marginLeft: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    opacity: 0.7,
    textTransform: 'capitalize',
  },
  message: {
    marginBottom: 12,
    lineHeight: 20,
  },
  detailsContainer: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
  },
  detailsLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailsText: {
    fontFamily: 'monospace',
    fontSize: 10,
  },
  retryMessage: {
    marginBottom: 16,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  retryButton: {
    borderRadius: 8,
  },
});

NetworkErrorDisplay.displayName = 'NetworkErrorDisplay';
