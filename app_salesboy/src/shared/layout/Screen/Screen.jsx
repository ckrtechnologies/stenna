import React, { useState } from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import { useScreenEdges } from './useScreenEdges';
import ScreenBody from './ScreenBody';
import ScreenFooter from './ScreenFooter';
import { theme } from '@theme';

export default function Screen({
  variant = 'scroll',
  header = null,
  footer = null,
  edges = null,
  barStyle = 'dark-content',
  backgroundColor = theme.colors.background,
  children,
  contentContainerStyle,
  refreshControl,
  style
}) {
  const [footerHeight, setFooterHeight] = useState(0);
  const resolvedEdges = useScreenEdges(edges, Boolean(header), Boolean(footer));

  const handleFooterLayout = (e) => {
    const { height } = e.nativeEvent.layout;
    if (height && height !== footerHeight) {
      setFooterHeight(height);
    }
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor,
          paddingTop: resolvedEdges.top,
          paddingLeft: resolvedEdges.left,
          paddingRight: resolvedEdges.right
        },
        style
      ]}
    >
      <StatusBar barStyle={barStyle} backgroundColor="transparent" translucent />
      
      {/* Zone 1: Fixed Header */}
      {header}

      {/* Zone 2: Middle Scrollable Body */}
      <ScreenBody
        variant={variant}
        footerHeight={footerHeight}
        contentContainerStyle={contentContainerStyle}
        refreshControl={refreshControl}
      >
        {children}
      </ScreenBody>

      {/* Zone 3: Fixed Sticky Footer (above keyboard) */}
      {footer && (
        <ScreenFooter
          bottomInset={resolvedEdges.bottom}
          onLayout={handleFooterLayout}
        >
          {footer}
        </ScreenFooter>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  }
});
