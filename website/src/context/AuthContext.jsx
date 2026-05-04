import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isGuest, setIsGuest] = useState(sessionStorage.getItem('stenna_is_guest') === 'true');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check current session
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            if (session?.user) setIsGuest(false);
            setLoading(false);
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) setIsGuest(false);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const continueAsGuest = () => {
        setIsGuest(true);
        sessionStorage.setItem('stenna_is_guest', 'true');
    };

    const value = {
        user,
        isGuest,
        loading,
        continueAsGuest,
        signOut: () => {
            setIsGuest(false);
            sessionStorage.removeItem('stenna_is_guest');
            return supabase.auth.signOut();
        },
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
