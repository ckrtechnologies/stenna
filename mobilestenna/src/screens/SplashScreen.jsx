import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withDelay,
    Easing
} from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
    const { user } = useAuth();
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.9);
    const letterSpacing = useSharedValue(20);

    useEffect(() => {
        // Animation sequence
        opacity.value = withTiming(1, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
        scale.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.exp) });
        letterSpacing.value = withTiming(10, { duration: 2000, easing: Easing.out(Easing.exp) });

        // Navigation timer
        const timer = setTimeout(() => {
            if (user) {
                navigation.replace('AppContent');
            } else {
                navigation.replace('Login');
            }
        }, 2500); // 2.5 seconds to ensure animation finishes beautifully

        return () => clearTimeout(timer);
    }, [user, navigation]);

    const animatedTextStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ scale: scale.value }],
            letterSpacing: letterSpacing.value,
        };
    });

    const animatedLineStyle = useAnimatedStyle(() => {
        return {
            width: withTiming(opacity.value * 60, { duration: 1500 }),
            opacity: opacity.value,
        };
    });

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Animated.Text style={[styles.logoText, animatedTextStyle]}>
                    STENNA
                </Animated.Text>
                <Animated.View style={[styles.line, animatedLineStyle]} />
                <Animated.Text style={[styles.subtitle, { opacity: opacity.value }]}>
                    PURE MATERIALITY
                </Animated.Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoText: {
        fontSize: 40,
        fontWeight: '300',
        color: '#000',
        marginBottom: 10,
    },
    line: {
        height: 1,
        backgroundColor: '#000',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 10,
        letterSpacing: 4,
        color: '#666',
        fontWeight: '400',
    },
});

export default SplashScreen;
