import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StennaMonogram from './StennaMonogram';
import { theme } from '@theme';

export default function StennaLogo({ size = 'md', subtitle = 'FIELD FORCE', light = true, style }) {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  const monogramSize = isLarge ? 44 : isSmall ? 24 : 32;
  const titleSize = isLarge ? 22 : isSmall ? 15 : 18;

  return (
    <View style={[styles.container, style]}>
      <StennaMonogram size={monogramSize} />
      <View style={styles.textCol}>
        <Text style={[styles.brandTitle, { fontSize: titleSize, color: light ? '#FFFFFF' : theme.colors.textMain }]}>
          S T E N N A
        </Text>
        {subtitle && (
          <Text style={[styles.brandSub, { color: light ? theme.colors.gold : theme.colors.primaryDark }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  textCol: {
    justifyContent: 'center'
  },
  brandTitle: {
    fontWeight: '800',
    letterSpacing: 3,
    lineHeight: 22
  },
  brandSub: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 2
  }
});
