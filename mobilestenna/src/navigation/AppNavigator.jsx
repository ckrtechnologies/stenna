import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { View, Text, TouchableOpacity } from 'react-native';

// Screens
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import CatalogScreen from '../screens/CatalogScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WallpaperDetailScreen from '../screens/WallpaperDetailScreen';
import VisualizerScreen from '../screens/VisualizerScreen';
import WishlistScreen from '../screens/WishlistScreen';
import AIRecommendationScreen from '../screens/AIRecommendationScreen';
import MyEnquiriesScreen from '../screens/MyEnquiriesScreen';
import VisualizationHistoryScreen from '../screens/VisualizationHistoryScreen';
import PersonalDetailsScreen from '../screens/PersonalDetailsScreen';
import { Home, Archive, Sparkles, Zap, Heart, User, Menu, MessageSquare, History } from 'lucide-react-native';
// import { TouchableOpacity } from 'react-native';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const MainStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Catalog" component={CatalogScreen} />
    </Stack.Navigator>
);

const AppTabs = () => (
    <Tab.Navigator
        screenOptions={({ route, navigation }) => ({
            headerShown: true,
            headerTitle: 'STENNA',
            headerTitleStyle: { fontWeight: '300', letterSpacing: 8, fontSize: 16, textAlign: 'center' },
            headerLeft: () => (
                <TouchableOpacity
                    onPress={() => navigation.openDrawer()}
                    style={{ marginLeft: 20 }}
                >
                    <Menu color="#000" size={24} strokeWidth={2} />
                </TouchableOpacity>
            ),
            headerRight: () => <View style={{ width: 44 }} />, // Balanced header
            tabBarActiveTintColor: '#000',
            tabBarInactiveTintColor: '#999',
            tabBarStyle: {
                backgroundColor: '#fff',
                borderTopColor: '#f0f0f0',
                height: 65,
                paddingBottom: 10,
                paddingTop: 10,
            },
            tabBarLabelStyle: {
                fontSize: 9,
                fontWeight: 'bold',
                letterSpacing: 1,
            },
            tabBarIcon: ({ color, size }) => {
                if (route.name === 'HomeTab') return <Home color={color} size={20} />;
                if (route.name === 'CatalogTab') return <Archive color={color} size={20} />;
                if (route.name === 'VisualizerTab') return <Sparkles color={color} size={20} />;
                if (route.name === 'RecommendationTab') return <Zap color={color} size={20} />;
                if (route.name === 'ProfileTab') return <User color={color} size={20} />;
                return null;
            },
        })}
    >
        <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'HOME' }} />
        <Tab.Screen name="CatalogTab" component={CatalogScreen} options={{ title: 'CATALOG' }} />
        <Tab.Screen name="VisualizerTab" component={VisualizerScreen} options={{ title: 'VISUALIZE' }} />
        <Tab.Screen name="RecommendationTab" component={AIRecommendationScreen} options={{ title: 'AI RECOMM' }} />
        <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'PROFILE' }} />
    </Tab.Navigator>
);

const AppDrawer = () => (
    <Drawer.Navigator
        screenOptions={({ navigation }) => ({
            headerShown: false, // Tabs handle the header
            drawerActiveTintColor: '#000',
            drawerInactiveTintColor: '#666',
            drawerLabelStyle: { fontSize: 11, letterSpacing: 2, fontWeight: '800' },
            drawerItemStyle: { marginVertical: 5 },
            drawerStyle: { width: '80%' }
        })}
    >
        <Drawer.Screen
            name="MainTabs"
            component={AppTabs}
            options={{
                title: 'HOME',
                drawerIcon: ({ color, size }) => <Home color={color} size={18} />
            }}
        />
        <Drawer.Screen
            name="CatalogDrawer"
            component={CatalogScreen}
            options={{
                title: 'CATALOG',
                drawerIcon: ({ color, size }) => <Archive color={color} size={18} />
            }}
        />
        <Drawer.Screen
            name="AIRecommendationDrawer"
            component={AIRecommendationScreen}
            options={{
                title: 'AI RECOMMENDED',
                drawerIcon: ({ color, size }) => <Zap color={color} size={18} />
            }}
        />
        <Drawer.Screen
            name="VisualizerDrawer"
            component={VisualizerScreen}
            options={{
                title: 'AI VISUALIZER',
                drawerIcon: ({ color, size }) => <Sparkles color={color} size={18} />
            }}
        />
        <Drawer.Screen
            name="WishlistDrawer"
            component={WishlistScreen}
            options={{
                title: 'WISHLIST',
                drawerIcon: ({ color, size }) => <Heart color={color} size={18} />
            }}
        />
        <Drawer.Screen
            name="MyEnquiriesDrawer"
            component={MyEnquiriesScreen}
            options={{
                title: 'MY ENQUIRIES',
                drawerIcon: ({ color, size }) => <MessageSquare color={color} size={18} />
            }}
        />
        <Drawer.Screen
            name="VisualizationHistoryDrawer"
            component={VisualizationHistoryScreen}
            options={{
                title: 'HISTORY',
                drawerIcon: ({ color, size }) => <History color={color} size={18} />
            }}
        />
        <Drawer.Screen
            name="ProfileDrawer"
            component={ProfileScreen}
            options={{
                title: 'MY ACCOUNT',
                drawerIcon: ({ color, size }) => <User color={color} size={18} />
            }}
        />
    </Drawer.Navigator>
);

const AppNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) return null; // Still show null while checking auth, Splash will handle its own 2s

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
                // Public Routes
                <>
                    <Stack.Screen name="Splash" component={SplashScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                </>
            ) : (
                // Protected Routes
                <>
                    <Stack.Screen name="AppContent" component={AppDrawer} />
                    <Stack.Screen name="WallpaperDetail" component={WallpaperDetailScreen} />
                    <Stack.Screen name="VisualizationHistory" component={VisualizationHistoryScreen} />
                    <Stack.Screen name="MyEnquiries" component={MyEnquiriesScreen} />
                    <Stack.Screen name="Wishlist" component={WishlistScreen} />
                    <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} />
                </>
            )}
        </Stack.Navigator>
    );
};

export default AppNavigator;
