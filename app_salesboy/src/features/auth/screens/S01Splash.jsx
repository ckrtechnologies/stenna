import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar, Image } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCredentials } from '../slice';
import { ROUTES } from '@navigation/routes';
import { StennaMonogram } from '@shared/ui/Brand';
import { theme } from '@theme';

export default function S01Splash({ navigation }) {
  const dispatch = useDispatch();

  useEffect(() => {
    async function checkAuthSession() {
      try {
        const storedToken = await AsyncStorage.getItem('@stenna_token');
        const storedUser = await AsyncStorage.getItem('@stenna_user');

        if (storedToken && storedUser) {
          dispatch(
            setCredentials({
              token: storedToken,
              user: JSON.parse(storedUser)
            })
          );
          navigation.replace(ROUTES.MAIN_TABS);
          return;
        }
      } catch (err) {
        // Fallback to login on read failure
      }
      navigation.replace(ROUTES.LOGIN);
    }

    const timer = setTimeout(checkAuthSession, 900);
    return () => clearTimeout(timer);
  }, [dispatch, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.navyDark} />

      <View style={styles.centerContent}>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.splashLogo}
          resizeMode="contain"
        />

        <View style={styles.fieldBadge}>
          <Text style={styles.fieldBadgeText}>ENTERPRISE FIELD FORCE</Text>
        </View>
      </View>

      <View style={styles.bottomLoader}>
        <ActivityIndicator size="small" color={theme.colors.gold} />
        <Text style={styles.versionText}>v1.0.0 (Build 101) • CKR Technologies</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.navyDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  centerContent: {
    alignItems: 'center'
  },
  splashLogo: {
    width: 240,
    height: 52,
    marginBottom: 8
  },
  monogramWrap: {
    marginBottom: 20,
    shadowColor: theme.colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 6,
    color: '#FFFFFF'
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: theme.colors.gold,
    marginTop: 6
  },
  fieldBadge: {
    marginTop: 18,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)'
  },
  fieldBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#E2E8F0'
  },
  bottomLoader: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    gap: 10
  },
  versionText: {
    fontSize: 11,
    color: '#64748B',
    letterSpacing: 0.3
  }
});
