import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { signIn, signInWithGoogle } = useAuth();

    const handleLogin = async () => {
        setIsLoggingIn(true);
        try {
            await signIn({ email, password });
            navigation.navigate('AppContent');
        } catch (error) {
            console.error('Login failed:', error);
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoggingIn(true);
        try {
            await signInWithGoogle();
            navigation.navigate('AppContent');
        } catch (error) {
            console.error('Google Sign-In failed:', error);
            if (error.code === '10') {
                console.error('DEVELOPER_ERROR: This usually means the SHA-1 or Client ID in Google Cloud does not match your app.');
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.form}>
                    <Text style={styles.title}>LOG IN</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="EMAIL"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        editable={!isLoggingIn}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="PASSWORD"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!isLoggingIn}
                    />

                    <TouchableOpacity
                        style={[styles.button, isLoggingIn && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>CONTINUE</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        style={[styles.googleButton, isLoggingIn && styles.buttonDisabled]}
                        onPress={handleGoogleSignIn}
                        disabled={isLoggingIn}
                    >
                        <Text style={styles.googleButtonText}>CONTINUE WITH GOOGLE</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.link}
                        onPress={() => navigation.navigate('Signup')}
                        disabled={isLoggingIn}
                    >
                        <Text style={styles.linkText}>CREATE AN ACCOUNT</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    form: {
        padding: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: '300',
        letterSpacing: 4,
        marginBottom: 50,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#000000ff',
        marginBottom: 30,
        fontSize: 12,
        letterSpacing: 2,
    },
    button: {
        backgroundColor: '#000',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 12,
        letterSpacing: 2,
        fontWeight: 'bold',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 30,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#eee',
    },
    dividerText: {
        marginHorizontal: 15,
        fontSize: 10,
        color: '#999',
        letterSpacing: 1,
    },
    googleButton: {
        backgroundColor: '#fff',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
    },
    googleButtonText: {
        color: '#000',
        fontSize: 12,
        letterSpacing: 2,
        fontWeight: 'bold',
    },
    link: {
        marginTop: 30,
        alignItems: 'center',
    },
    linkText: {
        fontSize: 10,
        letterSpacing: 1,
        color: '#666',
    },
});

export default LoginScreen;
