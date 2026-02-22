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
        // Upsert the first record or match by existing ID if provided
        const { id, ...settings } = req.body;
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
        res.status(200).json({ message: 'Store settings updated', data: result.data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
