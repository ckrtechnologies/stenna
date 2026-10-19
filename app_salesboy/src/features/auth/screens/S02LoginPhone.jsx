import React, { useState, useRef } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Screen from '@shared/layout/Screen';
import Button from '@shared/ui/Button';
import Input from '@shared/ui/Input';
import { StennaLogo } from '@shared/ui/Brand';
import { IconPhone, IconLock } from '@shared/icons';
import { useLoginMutation } from '../api';
import { baseApi } from '@store/baseApi';
import { setCredentials } from '../slice';
import { ROUTES } from '@navigation/routes';
import { theme } from '@theme';

export default function S02LoginPhone({ navigation }) {
  const dispatch = useDispatch();
  const [loginApi, { isLoading }] = useLoginMutation();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const passwordRef = useRef(null);

  const handleLogin = async () => {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password || password.length < 4) {
      Alert.alert('Invalid Password', 'Please enter your password.');
      return;
    }

    try {
      const res = await loginApi({ phone: cleanPhone, password }).unwrap();
      const { token, user } = res;

      await AsyncStorage.setItem('@stenna_token', token);
      await AsyncStorage.setItem('@stenna_user', JSON.stringify(user));

      dispatch(baseApi.util.resetApiState());
      dispatch(setCredentials({ token, user }));
      navigation.replace(ROUTES.MAIN_TABS);
    } catch (err) {
      Alert.alert(
        'Login Failed',
        err?.data?.error?.message || err?.data?.message || 'Invalid credentials or inactive account.'
      );
    }
  };

  return (
    <Screen
      variant="form"
      footer={
        <Button
          title="Sign In to Territory"
          onPress={handleLogin}
          loading={isLoading}
        />
      }
    >
      <View style={styles.headerHero}>
        <StennaLogo size="lg" light={false} subtitle="ENTERPRISE FIELD FORCE" style={styles.brandLogo} />

        <Text style={styles.title}>Sales Rep Portal</Text>
        <Text style={styles.subtitle}>
          Sign in to access your assigned territory retail stores, log daily field visits, and audit catalog books.
        </Text>
      </View>

      <Input
        label="Registered Mobile Number"
        placeholder="9811223344"
        keyboardType="phone-pad"
        maxLength={10}
        value={phone}
        onChangeText={setPhone}
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        prefix={
          <View style={styles.inputPrefix}>
            <IconPhone size={18} color={theme.colors.primary} />
            <Text style={styles.countryCode}>+91</Text>
          </View>
        }
      />

      <Input
        ref={passwordRef}
        label="Account Password"
        placeholder="••••••••"
        secureTextEntry={secureText}
        value={password}
        onChangeText={setPassword}
        returnKeyType="done"
        onSubmitEditing={handleLogin}
        prefix={
          <View style={styles.inputPrefix}>
            <IconLock size={18} color={theme.colors.primary} />
          </View>
        }
        helper="Assigned by Stenna territory administrator."
      />

      <View style={styles.securityNote}>
        <IconLock size={13} color={theme.colors.primaryDark} />
        <Text style={styles.securityText}>
          End-to-end encrypted session with Stenna enterprise backend.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerHero: {
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 8
  },
  brandLogo: {
    marginBottom: 16
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.navyPrimary,
    letterSpacing: -0.3,
    marginBottom: 6
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 12
  },
  inputPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textMain
  },
  securityNote: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(29, 78, 216, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(29, 78, 216, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  securityText: {
    fontSize: 11,
    color: theme.colors.primaryDark,
    fontWeight: '600',
    textAlign: 'center'
  }
});
