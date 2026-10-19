import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  ScrollView,
  StatusBar,
  Modal
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { useDrawer } from './DrawerContext';
import { logout } from '@features/auth/slice';
import { useGetAppDashboardQuery } from '@features/dashboard/api';
import { baseApi } from '@store/baseApi';
import { ROUTES } from '../routes';
import { StennaLogo } from '@shared/ui/Brand';
import {
  IconLayoutDashboard,
  IconBuildingStore,
  IconClipboardList,
  IconUser,
  IconRefresh,
  IconLogout,
  IconX,
  IconPlus,
  IconChevronRight
} from '@shared/icons';
import { theme } from '@theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 330);

export default function AppDrawer() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { isOpen, closeDrawer } = useDrawer();
  const user = useSelector((state) => state.auth?.user);
  const { data: dashData } = useGetAppDashboardQuery();
  const assignedZones = dashData?.data?.assignedZones || [];
  const assignedMarkets = dashData?.data?.assignedMarkets || [];
  const assignedCount = dashData?.data?.assignedShopsCount || 0;
  const primaryZoneName = assignedZones.length > 0 ? assignedZones[0].name : 'Primary Zone';

  const [visible, setVisible] = useState(false);
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      translateX.value = withTiming(0, { duration: 240, easing: Easing.out(Easing.cubic) });
      backdropOpacity.value = withTiming(0.65, { duration: 240, easing: Easing.out(Easing.cubic) });
    } else if (visible) {
      backdropOpacity.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.cubic) });
      translateX.value = withTiming(-DRAWER_WIDTH, { duration: 200, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished) {
          runOnJS(setVisible)(false);
        }
      });
    }
  }, [isOpen]);

  const animatedDrawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value
  }));

  const handleNavigate = (route) => {
    closeDrawer();
    setTimeout(() => {
      navigation?.navigate(route);
    }, 150);
  };

  const handleLogout = () => {
    closeDrawer();
    setTimeout(() => {
      dispatch(baseApi.util.resetApiState());
      dispatch(logout());
      navigation?.reset({ index: 0, routes: [{ name: ROUTES.LOGIN }] });
    }, 150);
  };

  return (
    <Modal
      transparent
      visible={visible || isOpen}
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeDrawer}
    >
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Dark Dim Backdrop */}
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <Animated.View style={[StyleSheet.absoluteFillObject, styles.backdrop, animatedBackdropStyle]} />
        </TouchableWithoutFeedback>

        {/* Slide-out Drawer Panel */}
        <Animated.View style={[styles.drawerPanel, { width: DRAWER_WIDTH }, animatedDrawerStyle]}>
        <View style={[styles.headerSection, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerTopRow}>
            <StennaLogo size="sm" subtitle="ENTERPRISE FIELD FORCE" />
            <TouchableOpacity onPress={closeDrawer} style={styles.closeBtn} activeOpacity={0.7}>
              <IconX size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Rep Identity Card */}
          <View style={styles.repCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {(user?.name || 'SR').slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.repMeta}>
              <Text style={styles.repName} numberOfLines={1}>
                {user?.name || 'Sales Representative'}
              </Text>
              <Text style={styles.repPhone}>{user?.phone || '+91 9876543210'}</Text>
              <View style={styles.rolePill}>
                <View style={styles.statusDot} />
                <Text style={styles.roleText}>Field Sales Executive</Text>
              </View>
              <View style={styles.territoryPill}>
                <Text style={styles.territoryPillText} numberOfLines={1}>
                  📍 {primaryZoneName} • {assignedMarkets.length} Mkts • {assignedCount} Shops
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick CTA: Log Visit */}
        <View style={styles.ctaWrap}>
          <TouchableOpacity
            style={styles.logVisitBtn}
            activeOpacity={0.85}
            onPress={() => handleNavigate(ROUTES.RECORD_VISIT)}
          >
            <IconPlus size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.logVisitText}>Log New Field Visit</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation List */}
        <ScrollView style={styles.navList} contentContainerStyle={styles.navScrollContent}>
          <Text style={styles.navSectionLabel}>CORE WORKBENCH</Text>

          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => handleNavigate(ROUTES.DASHBOARD)}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(29, 78, 216, 0.12)' }]}>
              <IconLayoutDashboard size={20} color={theme.colors.primaryLight} />
            </View>
            <Text style={styles.navItemText}>Field Dashboard</Text>
            <IconChevronRight size={16} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => handleNavigate(ROUTES.SHOPS)}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(5, 150, 105, 0.12)' }]}>
              <IconBuildingStore size={20} color={theme.colors.callGreenLight} />
            </View>
            <Text style={styles.navItemText}>Assigned Stores Beat</Text>
            <IconChevronRight size={16} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => handleNavigate(ROUTES.VISITS_LEDGER)}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(212, 175, 55, 0.12)' }]}>
              <IconClipboardList size={20} color={theme.colors.gold} />
            </View>
            <Text style={styles.navItemText}>Field Visits Ledger</Text>
            <IconChevronRight size={16} color="#475569" />
          </TouchableOpacity>

          <Text style={[styles.navSectionLabel, { marginTop: 18 }]}>APP & MANAGEMENT</Text>

          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => handleNavigate(ROUTES.PROFILE)}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(148, 163, 184, 0.12)' }]}>
              <IconRefresh size={20} color="#94A3B8" />
            </View>
            <Text style={styles.navItemText}>Offline Queue & Sync</Text>
            <IconChevronRight size={16} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => handleNavigate(ROUTES.PROFILE)}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(148, 163, 184, 0.12)' }]}>
              <IconUser size={20} color="#94A3B8" />
            </View>
            <Text style={styles.navItemText}>Rep Profile & Settings</Text>
            <IconChevronRight size={16} color="#475569" />
          </TouchableOpacity>
        </ScrollView>

        {/* Footer & Logout */}
        <View style={[styles.footerSection, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.85}
            onPress={handleLogout}
          >
            <IconLogout size={18} color="#FFFFFF" strokeWidth={2.2} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.footerVersion}>Stenna Field Force v1.0.0 (Build 101)</Text>
          <Text style={styles.agencyTag}>CKR Technologies Production Standard</Text>
        </View>
      </Animated.View>
    </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000'
  },
  drawerPanel: {
    height: '100%',
    backgroundColor: theme.colors.navyDark,
    borderRightWidth: 1,
    borderRightColor: theme.colors.navyBorder,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 20
  },
  headerSection: {
    backgroundColor: theme.colors.navyPrimary,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.navyBorder
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  repCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.navyCard,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)'
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: theme.colors.gold,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16
  },
  repMeta: {
    flex: 1
  },
  repName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15
  },
  repPhone: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 1
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.callGreenLight
  },
  roleText: {
    color: theme.colors.gold,
    fontSize: 11,
    fontWeight: '600'
  },
  territoryPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
    alignSelf: 'flex-start'
  },
  territoryPillText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '600'
  },
  ctaWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4
  },
  logVisitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4
  },
  logVisitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3
  },
  navList: {
    flex: 1,
    paddingHorizontal: 14
  },
  navScrollContent: {
    paddingTop: 14,
    paddingBottom: 16
  },
  navSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 6
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: 'transparent'
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  navItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0'
  },
  footerSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.navyBorder,
    backgroundColor: theme.colors.navyDark
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3
  },
  footerVersion: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center'
  },
  agencyTag: {
    fontSize: 9,
    color: '#475569',
    textAlign: 'center',
    marginTop: 2
  }
});
