import { supabase } from '../config/supabase.js';

export const getAllUsers = async (req, res) => {
    try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(404).json({ message: 'User not found' });
    }
};

export const updateProfile = async (req, res) => {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== id) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    try {
        const { data, error } = await supabase.from('profiles').update(req.body).eq('id', id).select();
        if (error) throw error;
        res.status(200).json({ message: 'Profile updated', data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) throw error;
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserCredits = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];

        const { data: usage, error } = await supabase
            .from('user_api_usage')
            .select('hits_count')
            .eq('user_id', userId)
            .eq('usage_date', today)
            .maybeSingle();

        if (error) throw error;

        const hits = usage ? usage.hits_count : 0;

        const { data: storeInfo } = await supabase
            .from('store_settings')
            .select('daily_ai_credit_limit')
            .maybeSingle();

        const limit = storeInfo?.daily_ai_credit_limit ?? 100;
        const remaining = Math.max(0, limit - hits);

        res.status(200).json({
            hits,
            limit,
            remaining,
            resetDate: today
        });
    } catch (error) {
        console.error('Error fetching user credits:', error);
        res.status(500).json({ message: 'Failed to fetch credit usage information.' });
    }
};

