import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'react-native';

function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <NavigationContainer>
                    <StatusBar barStyle="dark-content" backgroundColor={'#dd1818ff'} />
                    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
                        <AppNavigator />
                    </SafeAreaView>
                </NavigationContainer>
            </AuthProvider>
        </SafeAreaProvider>
    );
}

export default App;
