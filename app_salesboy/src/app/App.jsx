import React from 'react';
import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Providers from './Providers';
import RootNavigator from '@navigation/RootNavigator';

LogBox.ignoreLogs(['Each child in a list']);

export default function App() {
  return (
    <Providers>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </Providers>
  );
}
