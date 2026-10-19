import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@theme';

export default function StatusChip({ isAvailable, solid = false, style }) {
  if (isAvailable) {
    return (
      <View style={[
        styles.chip,
        solid ? styles.availableSolid : styles.availableChip,
        style
      ]}>
        <View style={[styles.dot, solid ? styles.dotWhite : styles.availableDot]} />
        <Text style={[styles.text, solid ? styles.textWhite : styles.availableText]}>
          Open & Available
        </Text>
      </View>
    );
  }

  return (
    <View style={[
      styles.chip,
      solid ? styles.closedSolid : styles.closedChip,
      style
    ]}>
      <View style={[styles.dot, solid ? styles.dotWhite : styles.closedDot]} />
      <Text style={[styles.text, solid ? styles.textWhite : styles.closedText]}>
        Closed / Unavailable
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    gap: 6
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  dotWhite: {
    backgroundColor: '#FFFFFF'
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2
  },
  textWhite: {
    color: '#FFFFFF'
  },
  availableChip: {
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.25)'
  },
  availableDot: {
    backgroundColor: theme.colors.callGreen
  },
  availableText: {
    color: theme.colors.callGreen
  },
  availableSolid: {
    backgroundColor: theme.colors.callGreen
  },
  closedChip: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.25)'
  },
  closedDot: {
    backgroundColor: theme.colors.danger
  },
  closedText: {
    color: theme.colors.danger
  },
  closedSolid: {
    backgroundColor: theme.colors.danger
  }
});
