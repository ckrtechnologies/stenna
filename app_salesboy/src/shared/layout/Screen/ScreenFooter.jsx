import React from 'react';
import { View, StyleSheet } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { theme } from '@theme';

export default function ScreenFooter({ children, bottomInset = 0, onLayout }) {
  if (!children) return null;

  return (
    <KeyboardStickyView
      onLayout={onLayout}
      style={[
        styles.stickyWrap,
        {
          paddingBottom: bottomInset > 0 ? bottomInset : theme.spacing.md
        }
      ]}
    >
      <View style={styles.contentWrap}>{children}</View>
    </KeyboardStickyView>
  );
}

const styles = StyleSheet.create({
  stickyWrap: {
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: theme.spacing.gutter,
    paddingTop: theme.spacing.md,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8
  },
  contentWrap: {
    width: '100%'
  }
});
