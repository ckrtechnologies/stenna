import { supabase } from '../config/supabase.js';

export const getAllGroups = async (req, res) => {
    try {
        console.log("Fetching all groups...");
        const { data, error } = await supabase.from('category_groups').select('*');
        if (error) {
            console.error("Supabase Error fetching groups:", error);
            throw error;
        }
        console.log(`Found ${data?.length || 0} groups`);
        res.status(200).json(data);
    } catch (error) {
        console.error("Catch Error in getAllGroups:", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getGroupById = async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase.from('category_groups').select('*').eq('id', id).single();
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(404).json({ message: 'Category group not found' });
    }
};

export const createGroup = async (req, res) => {
    try {
        const { data, error } = await supabase.from('category_groups').insert(req.body).select();
        if (error) throw error;
        res.status(201).json({ message: 'Category group created', data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateGroup = async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase.from('category_groups').update(req.body).eq('id', id).select();
        if (error) throw error;
        res.status(200).json({ message: 'Category group updated', data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteGroup = async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase.from('category_groups').delete().eq('id', id);
        if (error) throw error;
        res.status(200).json({ message: 'Category group deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
