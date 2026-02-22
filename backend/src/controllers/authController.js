
import { supabase } from '../config/supabase.js';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // Fetch user profile for role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        let role = profile?.role;
        // Fallback & Auto-Sync: If profile is missing, check Auth metadata
        if (!role) {
            role = data.user.app_metadata?.role || data.user.user_metadata?.role || 'admin';

            // Create the missing profile entry
            const { error: syncError } = await supabase.from('profiles').insert({
                id: data.user.id,
                full_name: data.user.user_metadata?.full_name || email.split('@')[0],
                role: role
            });
            if (syncError) console.error('Profile sync error:', syncError);
        }

        const token = jwt.sign(
            { id: data.user.id, email: data.user.email, role: role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 86400000 // 1 day
        });

        const userResponse = {
            id: data.user.id,
            email: data.user.email,
            role: role,
            token: token
        };
        res.status(200).json({ user: userResponse });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(401).json({ message: error.message });
    }
};



export const googleLogin = async (req, res) => {
    const { token } = req.body;
    try {
        // Verify the token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) throw new Error('Invalid Supabase token');

        // Check if profile exists, if not create it
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        let role = profile?.role;
        if (!role) {
            role = user.app_metadata?.role || user.user_metadata?.role || 'customer';
            // Create the missing profile entry
            await supabase.from('profiles').insert({
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email.split('@')[0],
                role: role
            });
        }

        // Issue App JWT
        const appToken = jwt.sign(
            { id: user.id, email: user.email, role: role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.cookie('token', appToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 86400000 // 1 day
        });

        const userResponse = {
            id: user.id,
            email: user.email,
            role: role,
            token: appToken
        };
        res.status(200).json({ user: userResponse });

    } catch (error) {
        console.error('Google Login Error:', error);
        res.status(401).json({ message: error.message });
    }
};

export const register = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: role || 'customer'
                }
            }
        });
        if (error) throw error;

        // Create profile in public.profiles table
        const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: email.split('@')[0], // Default name
            role: role || 'customer'
        });

        if (profileError) console.error('Profile creation error:', profileError);

        res.status(201).json({ message: 'User registered successfully', user: data.user });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(400).json({ message: error.message });
    }
};

export const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
};

export const me = (req, res) => {
    res.status(200).json(req.user);
};
