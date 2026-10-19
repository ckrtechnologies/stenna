import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import S03FieldDashboard from '@features/dashboard/screens/S03FieldDashboard';
import S04ShopsDirectory from '@features/shops/screens/S04ShopsDirectory';
import S09VisitsLedger from '@features/visits/screens/S09VisitsLedger';
import S10ProfileSync from '@features/profile/screens/S10ProfileSync';
import {
  IconLayoutDashboard,
  IconBuildingStore,
  IconClipboardList,
  IconUser
} from '@shared/icons';
import { ROUTES } from './routes';
import { theme } from '@theme';

const Tab = createBottomTabNavigator();

export default function MainBottomTabs({ navigation }) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <View style={styles.rootWrap}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.gold,
          tabBarInactiveTintColor: '#64748B',
          tabBarStyle: {
            backgroundColor: theme.colors.bottomBar,
            borderTopWidth: 1,
            borderTopColor: theme.colors.navyBorder,
            height: 60 + bottomPadding,
            paddingBottom: bottomPadding,
            paddingTop: 8,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 12
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.3,
            marginTop: 2
          }
        }}
      >
        <Tab.Screen
          name={ROUTES.DASHBOARD}
          component={S03FieldDashboard}
          options={{
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color, focused }) => (
              <IconLayoutDashboard
                size={22}
                color={color}
                strokeWidth={focused ? 2.4 : 1.8}
              />
            )
          }}
        />
        <Tab.Screen
          name={ROUTES.SHOPS}
          component={S04ShopsDirectory}
          options={{
            tabBarLabel: 'Shops',
            tabBarIcon: ({ color, focused }) => (
              <IconBuildingStore
                size={22}
                color={color}
                strokeWidth={focused ? 2.4 : 1.8}
              />
            )
          }}
        />
        <Tab.Screen
          name={ROUTES.VISITS_LEDGER}
          component={S09VisitsLedger}
          options={{
            tabBarLabel: 'My Ledger',
            tabBarIcon: ({ color, focused }) => (
              <IconClipboardList
                size={22}
                color={color}
                strokeWidth={focused ? 2.4 : 1.8}
              />
            )
          }}
        />
        <Tab.Screen
          name={ROUTES.PROFILE}
          component={S10ProfileSync}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <IconUser
                size={22}
                color={color}
                strokeWidth={focused ? 2.4 : 1.8}
              />
            )
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  rootWrap: {
    flex: 1,
    backgroundColor: theme.colors.navyDark
  }
});
