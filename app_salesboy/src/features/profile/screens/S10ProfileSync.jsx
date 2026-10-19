import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Screen from '@shared/layout/Screen';
import AppBar from '@shared/layout/AppBar';
import Card from '@shared/ui/Card';
import Button from '@shared/ui/Button';
import { baseApi } from '@store/baseApi';
import { logout } from '@features/auth/slice';
import { clearOfflineQueue } from '@features/visits/slice';
import { useRecordVisitMutation } from '@features/visits/api';
import { ROUTES } from '@navigation/routes';
import { theme } from '@theme';
import { IconPhone, IconRefresh, IconLogout, IconUser } from '@shared/icons';

export default function S10ProfileSync({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);
  const offlineQueue = useSelector((state) => state.visits?.offlineQueue || []);
  const [recordVisitApi] = useRecordVisitMutation();
  const [syncing, setSyncing] = useState(false);

  const handleSyncNow = async () => {
    if (offlineQueue.length === 0) {
      Alert.alert('All Synced', 'Your offline queue is empty. All visits are on the server!');
      return;
    }

    setSyncing(true);
    let successCount = 0;

    for (const item of offlineQueue) {
      try {
        const payload = {
          vendorId: item.vendorId,
          isAvailable: item.isAvailable !== false,
          comments: item.comments || null,
          booksShown: Array.isArray(item.booksShown) ? item.booksShown : [],
          booksBought: Array.isArray(item.booksBought) ? item.booksBought : []
        };
        await recordVisitApi(payload).unwrap();
        successCount++;
      } catch (err) {
        // Will remain in queue if still failing
      }
    }

    setSyncing(false);
    if (successCount > 0) {
      dispatch(clearOfflineQueue());
      Alert.alert('Sync Complete', `Successfully synced ${successCount} visits to the server.`);
    } else {
      Alert.alert('Sync Failed', 'Could not sync visits. Please check your internet connection.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out from this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('@stenna_token');
          await AsyncStorage.removeItem('@stenna_user');
          dispatch(baseApi.util.resetApiState());
          dispatch(logout());
          navigation.replace(ROUTES.LOGIN);
        }
      }
    ]);
  };

  return (
    <Screen
      variant="scroll"
      header={<AppBar title="Sales Rep Profile" showMenu={true} />}
      footer={
        <Button
          title="Sign Out"
          variant="danger"
          icon={<IconLogout size={18} color="#ffffff" />}
          onPress={handleLogout}
        />
      }
    >
      {/* Rep Card */}
      <Card variant="dark">
        <View style={styles.avatarRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(user?.name || 'S').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userCol}>
            <Text style={styles.userName}>{user?.name || 'Sales Representative'}</Text>
            <View style={styles.phoneRow}>
              <IconPhone size={13} color={theme.colors.call} />
              <Text style={styles.userPhone}>+91 {user?.phone || 'N/A'}</Text>
            </View>
            <View style={styles.roleTag}>
              <Text style={styles.roleText}>FIELD SALES EXECUTIVE</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Offline Data & Sync Manager */}
      <Card>
        <Text style={styles.cardHeader}>OFFLINE SYNC MANAGER</Text>
        <View style={styles.syncRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.syncTitle}>Pending Offline Queue</Text>
            <Text style={styles.syncCount}>{offlineQueue.length} visits queued</Text>
          </View>

          <Button
            title="Sync Now"
            variant="primary"
            icon={<IconRefresh size={16} color="#ffffff" />}
            onPress={handleSyncNow}
            loading={syncing}
            style={styles.syncBtn}
          />
        </View>
        <Text style={styles.syncNote}>
          Visits captured without internet connectivity are queued locally and automatically flush when back online.
        </Text>
      </Card>

      {/* App Diagnostics */}
      <Card>
        <Text style={styles.cardHeader}>APP & ENVIRONMENT</Text>
        <View style={styles.diagRow}>
          <Text style={styles.diagLabel}>Platform</Text>
          <Text style={styles.diagValue}>React Native (New Architecture)</Text>
        </View>
        <View style={styles.diagRow}>
          <Text style={styles.diagLabel}>App Version</Text>
          <Text style={styles.diagValue}>1.0.0 (Build 101)</Text>
        </View>
        <View style={styles.diagRow}>
          <Text style={styles.diagLabel}>Backend API</Text>
          <Text style={styles.diagValue}>api.stenna.in (Production)</Text>
        </View>
        <View style={[styles.diagRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.diagLabel}>Agency Handover</Text>
          <Text style={styles.diagValue}>CKR Technologies</Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#060B14',
    borderWidth: 2,
    borderColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.elevation.glowGold
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.accent
  },
  userCol: {
    flex: 1
  },
  userName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#FFFFFF'
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3
  },
  userPhone: {
    fontSize: theme.typography.fontSize.xs,
    color: '#94A3B8'
  },
  roleTag: {
    backgroundColor: theme.colors.accentSurface,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.spacing.borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: 6
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.accent,
    letterSpacing: 0.6
  },
  cardHeader: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.heavy,
    color: theme.colors.primary,
    letterSpacing: 1,
    marginBottom: 10
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  syncTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textMain
  },
  syncCount: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2
  },
  syncBtn: {
    height: 38,
    paddingHorizontal: 14
  },
  syncNote: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textDim,
    lineHeight: 16
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight
  },
  diagLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted
  },
  diagValue: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textMain
  }
});
