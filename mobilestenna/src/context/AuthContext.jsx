import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';
import { supabase } from '../services/supabase';
import { authApi } from '../services/api';

const AuthContext = createContext(undefined);

const clientId = GOOGLE_WEB_CLIENT_ID || 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStorageData();
        configureGoogleSignIn();
    }, []);

    const configureGoogleSignIn = () => {
        console.log('--- Configuring Google Sign-In ---');
        console.log('Client ID from ENV:', GOOGLE_WEB_CLIENT_ID);
        console.log('Resolved Client ID:', clientId);

        if (!clientId || clientId.includes('YOUR_GOOGLE_WEB_CLIENT_ID')) {
            console.warn('--- Google Sign-In Missing Configuration ---');
            console.warn('Set GOOGLE_WEB_CLIENT_ID in your .env file');
            return;
        }
        GoogleSignin.configure({
            webClientId: clientId,
            offlineAccess: true,
        });
    };

    const loadStorageData = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('@stenna_token');
            const storedUser = await AsyncStorage.getItem('@stenna_user');

            console.log('--- Auth Storage Check ---');
            console.log('Stored Token:', storedToken ? 'FOUND (starts with ' + storedToken.substring(0, 10) + '...)' : 'NOT FOUND');
            console.log('Stored User:', storedUser ? 'FOUND' : 'NOT FOUND');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error('Failed to load storage data', e);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (credentials) => {
        try {
            const response = await authApi.login(credentials);
            const { user: userData } = response.data;

            setUser(userData);
            setToken(userData.token);

            await AsyncStorage.setItem('@stenna_token', userData.token);
            await AsyncStorage.setItem('@stenna_user', JSON.stringify(userData));
        } catch (error) {
            throw error;
        }
    };

    const signInWithGoogle = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            if (userInfo.data?.idToken) {
                const { data, error } = await supabase.auth.signInWithIdToken({
                    provider: 'google',
                    token: userInfo.data.idToken,
                });

                if (error) throw error;

                if (data.user) {
                    const userData = {
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.user_metadata?.full_name || data.user.email,
                        token: data.session?.access_token,
                    };

                    setUser(userData);
                    setToken(userData.token);

                    await AsyncStorage.setItem('@stenna_token', userData.token);
                    await AsyncStorage.setItem('@stenna_user', JSON.stringify(userData));

                    return userData;
                }
            }
        } catch (error) {
            console.error('Google Sign-In Error:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await GoogleSignin.signOut();
            await supabase.auth.signOut();
        } catch (e) {
            console.error('Sign out error:', e);
        }
        setUser(null);
        setToken(null);
        await AsyncStorage.removeItem('@stenna_token');
        await AsyncStorage.removeItem('@stenna_user');
    };

    return (
        <AuthContext.Provider value={{ user, token, signIn, signInWithGoogle, signOut, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};