import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const logoSource = require('../../../assets/logo.png');

export default function StennaLogo({ size = 'md', style }) {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  const width = isLarge ? 180 : isSmall ? 100 : 135;
  const height = isLarge ? 40 : isSmall ? 22 : 30;

  return (
    <View style={[styles.container, style]}>
      <Image
        source={logoSource}
        style={{ width, height }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'flex-start'
  }
});
