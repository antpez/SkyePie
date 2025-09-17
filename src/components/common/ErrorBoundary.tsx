import React, { Component, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useThemeContext } from '../../contexts/ThemeContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ error?: Error; onRetry?: () => void }> = ({ error, onRetry }) => {
  const { effectiveTheme, theme } = useThemeContext();

  return (
    <View style={styles.container}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.content}>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
            Oops! Something went wrong
          </Text>
          <Text variant="bodyMedium" style={[styles.message, { color: theme.colors.onSurface }]}>
            We're sorry, but something unexpected happened. Please try again.
          </Text>
          {error && (
            <Text variant="bodySmall" style={[styles.errorDetails, { color: theme.colors.onSurfaceVariant }]}>
              {error.message}
            </Text>
          )}
          <Button 
            mode="contained" 
            onPress={onRetry}
            style={styles.button}
          >
            Try Again
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
  },
  errorDetails: {
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  button: {
    marginTop: 8,
  },
});
