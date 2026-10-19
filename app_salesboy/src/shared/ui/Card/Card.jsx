import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '@theme';

export default function Card({ children, variant = 'default', style }) {
  return (
    <View style={[styles.card, styles[variant], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12
  },
  default: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3
  },
  dark: {
    backgroundColor: theme.colors.navyCard,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6
  },
  gold: {
    backgroundColor: theme.colors.navyCard,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    shadowColor: theme.colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6
  }
});
