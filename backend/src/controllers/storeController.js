import { supabase } from '../config/supabase.js';

export const getStoreInfo = async (req, res) => {
    try {
        const { data, error } = await supabase.from('store_settings').select('*').maybeSingle();
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateStoreInfo = async (req, res) => {
    try {
        const { id } = req.body;

        // Whitelist of valid database columns to prevent schema cache / unrecognized key errors
        const ALLOWED_COLUMNS = [
            'name', 'email', 'phone', 'address', 'website', 
            'currency', 'tax_rate', 'daily_ai_credit_limit',
            'logo_url', 'facebook_url', 'instagram_url', 
            'twitter_url', 'linkedin_url', 'whatsapp', 
            'working_hours', 'map_link'
        ];

        const settings = {};
        for (const key of ALLOWED_COLUMNS) {
            if (req.body[key] !== undefined) {
                settings[key] = req.body[key];
            }
        }

        let query = supabase.from('store_settings');
        let result;
        if (id) {
            result = await query.update(settings).eq('id', id).select();
        } else {
            // Check if any exists
            const { data: existing } = await supabase.from('store_settings').select('id').maybeSingle();
            if (existing) {
                result = await query.update(settings).eq('id', existing.id).select();
            } else {
                result = await query.insert(settings).select();
            }
        }

        if (result.error) throw result.error;
        res.status(200).json({ message: 'Store settings updated', data: result.data[0] || result.data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
