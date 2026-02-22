import { supabase } from '../config/supabase.js';

export const getAllCategories = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*, group:category_groups(*)');
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(404).json({ message: 'Category not found' });
    }
};

export const createCategory = async (req, res) => {
    const { group, ...insertData } = req.body; // Remove joined 'group' data if present
    try {
        const { data, error } = await supabase.from('categories').insert(insertData).select();
        if (error) throw error;
        res.status(201).json({ message: 'Category created', data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { group, ...updateData } = req.body; // Remove joined 'group' data if present
    try {
        const { data, error } = await supabase.from('categories').update(updateData).eq('id', id).select();
        if (error) throw error;
        res.status(200).json({ message: 'Category updated', data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
        res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
