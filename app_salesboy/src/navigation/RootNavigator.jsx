import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { defaultScreenOptions, modalScreenOptions } from './options';
import { ROUTES } from './routes';
import { DrawerProvider } from './drawer/DrawerContext';
import AppDrawer from './drawer/AppDrawer';

import S01Splash from '@features/auth/screens/S01Splash';
import S02LoginPhone from '@features/auth/screens/S02LoginPhone';
import MainBottomTabs from './MainBottomTabs';
import S05ShopDetail from '@features/shops/screens/S05ShopDetail';
import S06RecordVisit from '@features/visits/screens/S06RecordVisit';
import S08VisitSuccess from '@features/visits/screens/S08VisitSuccess';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <DrawerProvider>
      <View style={styles.rootContainer}>
        <Stack.Navigator screenOptions={defaultScreenOptions} initialRouteName={ROUTES.SPLASH}>
          <Stack.Screen name={ROUTES.SPLASH} component={S01Splash} />
          <Stack.Screen name={ROUTES.LOGIN} component={S02LoginPhone} />
          <Stack.Screen name={ROUTES.MAIN_TABS} component={MainBottomTabs} />

          {/* Detail Drilldown */}
          <Stack.Screen name={ROUTES.SHOP_DETAIL} component={S05ShopDetail} />

          {/* Modal Flows */}
          <Stack.Screen
            name={ROUTES.RECORD_VISIT}
            component={S06RecordVisit}
            options={modalScreenOptions}
          />
          <Stack.Screen
            name={ROUTES.VISIT_SUCCESS}
            component={S08VisitSuccess}
            options={{ gestureEnabled: false }}
          />
        </Stack.Navigator>
        <AppDrawer />
      </View>
    </DrawerProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1
  }
});
