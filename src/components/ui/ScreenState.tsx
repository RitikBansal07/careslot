import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from './Button';

interface LoadingStateProps {
  message?: string;
  style?: ViewStyle;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading healthcare providers...',
  style,
}) => (
  <View style={[styles.centerContainer, style]} testID="screen-loading">
    <ActivityIndicator size="large" color="#0284C7" />
    <Text style={styles.loadingMessage}>{message}</Text>
    {/* Skeleton item placeholders to show resilient async UI */}
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonCard} />
      <View style={styles.skeletonCard} />
    </View>
  </View>
);

interface EmptyStateProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'calendar-search',
  title,
  description,
  actionTitle,
  onAction,
  style,
}) => (
  <View style={[styles.centerContainer, style]} testID="screen-empty">
    <View style={styles.iconCircle}>
      <MaterialCommunityIcons name={icon} size={44} color="#0284C7" />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyDescription}>{description}</Text>
    {actionTitle && onAction && (
      <Button
        title={actionTitle}
        onPress={onAction}
        variant="primary"
        size="md"
        style={styles.actionBtn}
      />
    )}
  </View>
);

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We could not connect to CareSlot services. Please check your connection and try again.',
  onRetry,
  style,
}) => (
  <View style={[styles.centerContainer, style]} testID="screen-error">
    <View style={[styles.iconCircle, styles.errorIconCircle]}>
      <MaterialCommunityIcons name="alert-circle-outline" size={44} color="#EF4444" />
    </View>
    <Text style={styles.errorTitle}>{title}</Text>
    <Text style={styles.errorDescription}>{message}</Text>
    {onRetry && (
      <Button
        title="Try Again"
        onPress={onRetry}
        variant="primary"
        size="md"
        icon={<MaterialCommunityIcons name="refresh" size={18} color="#FFFFFF" />}
        style={styles.actionBtn}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: 300,
  },
  loadingMessage: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
  },
  skeletonContainer: {
    width: '100%',
    marginTop: 24,
    opacity: 0.6,
  },
  skeletonCard: {
    height: 90,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorIconCircle: {
    backgroundColor: '#FEE2E2',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
    marginBottom: 20,
  },
  actionBtn: {
    minWidth: 160,
  },
});

