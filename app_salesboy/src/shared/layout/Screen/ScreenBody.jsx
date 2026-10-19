import React from 'react';
import { View, ScrollView, Platform, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { theme } from '@theme';

export default function ScreenBody({
  variant = 'scroll',
  children,
  contentContainerStyle,
  footerHeight = 0,
  refreshControl
}) {
  if (variant === 'static') {
    return <View style={[styles.staticBody, contentContainerStyle]}>{children}</View>;
  }

  if (variant === 'form') {
    return (
      <KeyboardAwareScrollView
        mode={Platform.OS === 'android' ? 'layout' : 'insets'}
        bottomOffset={footerHeight + theme.spacing.keyboardCtaGap + 12}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        refreshControl={refreshControl}
      >
        {children}
      </KeyboardAwareScrollView>
    );
  }

  // Default: 'scroll'
  return (
    <ScrollView
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  staticBody: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.gutter,
    paddingVertical: theme.spacing.base
  }
});
