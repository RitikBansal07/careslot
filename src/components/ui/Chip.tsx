import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  AccessibilityRole,
} from 'react-native';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  badge?: number | string;
  icon?: React.ReactNode;
  variant?: 'filter' | 'slot' | 'badge';
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  testID?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  disabled = false,
  badge,
  icon,
  variant = 'filter',
  style,
  textStyle,
  accessibilityLabel,
  testID,
}) => {
  const isInteractive = Boolean(onPress) && !disabled;

  return (
    <TouchableOpacity
      testID={testID}
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole={'button' as AccessibilityRole}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ selected, disabled }}
      style={[
        styles.base,
        styles[variant],
        selected && styles.selected,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          styles.text,
          styles[`text_${variant}`],
          selected && styles.textSelected,
          disabled && styles.textDisabled,
          textStyle,
        ]}
      >
        {label}
      </Text>
      {badge !== undefined && (
        <View style={[styles.badge, selected && styles.badgeSelected]}>
          <Text style={[styles.badgeText, selected && styles.badgeTextSelected]}>
            {badge}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  filter: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  slot: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  badge: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  selected: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  disabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    opacity: 0.5,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  text_filter: {
    color: '#334155',
  },
  text_slot: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  text_badge: {
    fontSize: 12,
    color: '#0369A1',
    fontWeight: '600',
  },
  textSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  textDisabled: {
    color: '#94A3B8',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  badgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgeTextSelected: {
    color: '#FFFFFF',
  },
});

