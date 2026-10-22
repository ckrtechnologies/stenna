import { supabase } from '../config/supabase.js';

export const getAllLeads = async (req, res) => {
    try {
        let { startDate, endDate, datePreset } = req.query;
        if (datePreset && datePreset !== 'ALL' && (!startDate || !endDate)) {
            const now = new Date();
            const formatYMD = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            if (datePreset === 'TODAY') {
                startDate = formatYMD(now);
                endDate = formatYMD(now);
            } else if (datePreset === '7DAYS') {
                const past = new Date(now);
                past.setDate(past.getDate() - 7);
                startDate = formatYMD(past);
                endDate = formatYMD(now);
            } else if (datePreset === '30DAYS') {
                const past = new Date(now);
                past.setDate(past.getDate() - 30);
                startDate = formatYMD(past);
                endDate = formatYMD(now);
            } else if (datePreset === 'THIS_MONTH') {
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                startDate = formatYMD(firstDay);
                endDate = formatYMD(now);
            }
        }

        let query = supabase
            .from('leads')
            .select(`
                *,
                wallpaper:wallpapers(id, name, slug)
            `)
            .order('created_at', { ascending: false });

        if (startDate) {
            const sIso = startDate.includes('T') ? startDate : `${startDate}T00:00:00.000Z`;
            query = query.gte('created_at', sIso);
        }
        if (endDate) {
            const eIso = endDate.includes('T') ? endDate : `${endDate}T23:59:59.999Z`;
            query = query.lte('created_at', eIso);
        }

        const { data, error } = await query;
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
    const updates = { ...req.body };
    try {
        if (updates.status) {
            const s = String(updates.status).toLowerCase().trim();
            if (s === 'new') {
                updates.status = 'pending';
            } else if (s === 'contacted') {
                updates.status = 'processing';
            } else if (['pending', 'processing', 'resolved', 'closed'].includes(s)) {
                updates.status = s;
            } else {
                return res.status(400).json({
                    message: `Invalid status "${updates.status}". Allowed values: pending, processing, resolved, closed.`
                });
            }
        }
        const { data, error } = await supabase.from('leads').update(updates).eq('id', id).select();
        if (error) throw error;
        res.status(200).json({ message: 'Status updated successfully', data });
    } catch (error) {
        console.error('Error in updateLeadStatus:', error);
        res.status(500).json({ message: error.message });
    }
};