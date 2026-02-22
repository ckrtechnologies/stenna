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
