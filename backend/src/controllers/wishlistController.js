import { supabase } from '../config/supabase.js';

export const getWishlist = async (req, res) => {
    const userId = req.user.id;
    try {
        const { data, error } = await supabase.from('wishlist').select('*, wallpapers(*)').eq('user_id', userId);
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addToWishlist = async (req, res) => {
    const userId = req.user.id;
    const { wallpaperId } = req.body;
    try {
        const { data, error } = await supabase.from('wishlist').insert({ user_id: userId, wallpaper_id: wallpaperId }).select();
        if (error) throw error;
        res.status(201).json({ message: 'Added to wishlist', data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeFromWishlist = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    try {
        const { error } = await supabase.from('wishlist').delete().eq('id', id).eq('user_id', userId);
        if (error) throw error;
        res.status(200).json({ message: 'Removed from wishlist' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
