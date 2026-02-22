import { supabase } from '../config/supabase.js';

export const getAllLeads = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('leads')
            .select(`
                *,
                wallpaper:wallpapers(id, name, slug)
            `)
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserLeads = async (req, res) => {
    const { user_id, email } = req.query;
    try {
        let query = supabase.from('leads').select(`
            *,
            wallpaper:wallpapers(id, name, slug)
        `);

        if (user_id && email) {
            query = query.or(`user_id.eq.${user_id},email.eq.${email}`);
        } else if (user_id) {
            query = query.eq('user_id', user_id);
        } else if (email) {
            query = query.eq('email', email);
        } else {
            return res.status(400).json({ message: 'User identifier required' });
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create Lead (supports type: enquiry, sample, appointment)
export const createLead = async (req, res) => {
    try {
        const { type, ...leadData } = req.body;
        const { data, error } = await supabase.from('leads').insert({
            type: type || 'enquiry',
            ...leadData
        }).select();

        if (error) throw error;
        res.status(201).json({ message: `${type || 'Lead'} created successfully`, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateLeadStatus = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const { data, error } = await supabase.from('leads').update(updates).eq('id', id).select();
        if (error) throw error;
        res.status(200).json({ message: 'Status updated successfully', data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};