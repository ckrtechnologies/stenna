import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SignupScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signInWithGoogle } = useAuth();

    const handleSignup = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await authApi.register({ email, password });
            Alert.alert('Success', 'Account created! Please log in.', [
                { text: 'OK', onPress: () => navigation.navigate('Login') }
            ]);
        } catch (error) {
            console.error('Signup failed:', error);
            Alert.alert('Signup Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
            navigation.navigate('AppContent');
        } catch (error) {
            console.error('Google Sign-In failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.form}>
                    <Text style={styles.title}>SIGN UP</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="EMAIL"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="PASSWORD"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="CONFIRM PASSWORD"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>{loading ? 'CREATING...' : 'CREATE ACCOUNT'}</Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        style={[styles.googleButton, loading && styles.buttonDisabled]}
                        onPress={handleGoogleSignIn}
                        disabled={loading}
                    >
                        <Text style={styles.googleButtonText}>CONTINUE WITH GOOGLE</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.linkText}>ALREADY HAVE AN ACCOUNT? LOG IN</Text>
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
        borderBottomColor: '#eee',
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
    link: {
        marginTop: 30,
        alignItems: 'center',
    },
    linkText: {
        fontSize: 10,
        letterSpacing: 1,
        color: '#666',
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
});

export default SignupScreen;
