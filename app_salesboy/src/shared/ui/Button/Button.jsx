import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '@theme';

export default function Button({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'call' | 'gold' | 'secondary' | 'outline' | 'danger'
  loading = false,
  disabled = false,
  icon = null,
  style,
  textStyle
}) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        variant === 'primary' && styles.primaryShadow,
        variant === 'call' && styles.callShadow,
        variant === 'gold' && styles.goldShadow,
        isDisabled && styles.disabled,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'secondary' ? theme.colors.primary : '#ffffff'}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.textBase,
              styles[`${variant}Text`],
              isDisabled && styles.disabledText,
              textStyle
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    gap: 8
  },
  primary: {
    backgroundColor: theme.colors.primary
  },
  primaryShadow: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 5
  },
  call: {
    backgroundColor: theme.colors.callGreen
  },
  callShadow: {
    shadowColor: theme.colors.callGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 5
  },
  gold: {
    backgroundColor: theme.colors.gold
  },
  goldShadow: {
    shadowColor: theme.colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 5
  },
  secondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: theme.colors.border
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.primary
  },
  danger: {
    backgroundColor: theme.colors.danger
  },
  disabled: {
    opacity: 0.55
  },
  textBase: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3
  },
  primaryText: {
    color: '#ffffff'
  },
  callText: {
    color: '#ffffff'
  },
  goldText: {
    color: '#060B14'
  },
  secondaryText: {
    color: theme.colors.textMain
  },
  outlineText: {
    color: theme.colors.primary
  },
  dangerText: {
    color: '#ffffff'
  },
  disabledText: {}
});
