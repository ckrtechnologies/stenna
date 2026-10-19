import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDrawer } from '@navigation/drawer/DrawerContext';
import { IconMenu2, IconArrowLeft } from '@shared/icons';
import { StennaLogo } from '@shared/ui/Brand';
import { theme } from '@theme';

export default function AppBar({
  title,
  subtitle,
  onBack,
  onMenu,
  showMenu = false,
  showLogo = false,
  right,
  left
}) {
  const insets = useSafeAreaInsets();
  const { openDrawer } = useDrawer();

  const handleMenuPress = () => {
    if (onMenu) {
      onMenu();
    } else {
      openDrawer();
    }
  };

  return (
    <View style={[styles.bar, { paddingTop: insets.top > 0 ? insets.top : 8 }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.navyDark} />
      <View style={styles.inner}>
        {/* Left Action / Navigation Button */}
        <View style={styles.leftCol}>
          {showMenu ? (
            <TouchableOpacity
              onPress={handleMenuPress}
              style={styles.actionBtn}
              activeOpacity={0.7}
              accessibilityLabel="Open Navigation Drawer"
            >
              <IconMenu2 size={20} color={theme.colors.gold} strokeWidth={2.2} />
            </TouchableOpacity>
          ) : onBack ? (
            <TouchableOpacity
              onPress={onBack}
              style={styles.actionBtn}
              activeOpacity={0.7}
              accessibilityLabel="Navigate Back"
            >
              <IconArrowLeft size={20} color="#FFFFFF" strokeWidth={2.2} />
            </TouchableOpacity>
          ) : left ? (
            left
          ) : null}

          {/* Center Titles or Brand Logo */}
          {showLogo ? (
            <StennaLogo size="sm" subtitle={subtitle || 'FIELD FORCE'} />
          ) : (
            <View style={styles.titlesCol}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {subtitle && (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Right Action Slot */}
        <View style={styles.rightCol}>
          {right !== undefined ? right : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: theme.colors.headerBar,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.navyBorder,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6
  },
  inner: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16
  },
  leftCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  titlesCol: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.goldLight,
    marginTop: 1
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: theme.colors.callGreenLight
  },
  onlineText: {
    color: theme.colors.callGreenLight,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3
  }
});
