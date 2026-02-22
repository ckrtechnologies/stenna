import { supabase } from '../config/supabase.js';

// --- Book CRUD ---

export const createBook = async (req, res) => {
    const { name, code, description, image_url, is_active } = req.body;
    try {
        const { data, error } = await supabase
            .from('books')
            .insert({
                name,
                code,
                description,
                image_url,
                is_active: is_active !== undefined ? is_active : true
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ message: 'Book created successfully', data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllBooks = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('books')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getBookById = async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('books')
            .select(`
                *,
                wallpapers:book_wallpapers(
                    wallpaper:wallpapers(*)
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        // Flatten the structure for easier frontend consumption
        // The result from Supabase will look like: 
        // { ...book, wallpapers: [ { wallpaper: { ...wallpaperData } }, ... ] }
        // We want: { ...book, wallpapers: [ { ...wallpaperData }, ... ] }

        const formattedData = {
            ...data,
            wallpapers: data.wallpapers.map(w => w.wallpaper).filter(Boolean) // Filter out nulls if any join failed
        };

        res.status(200).json(formattedData);
    } catch (error) {
        res.status(404).json({ message: 'Book not found' });
    }
};

export const updateBook = async (req, res) => {
    const { id } = req.params;
    const { name, code, description, image_url, is_active } = req.body;
    try {
        const { data, error } = await supabase
            .from('books')
            .update({ name, code, description, image_url, is_active })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json({ message: 'Book updated successfully', data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteBook = async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('books')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Book Wallpapers Assignment ---

export const addWallpaperToBook = async (req, res) => {
    const { id: bookId } = req.params;
    const { wallpaperId } = req.body;
    try {
        const { data, error } = await supabase
            .from('book_wallpapers')
            .insert({ book_id: bookId, wallpaper_id: wallpaperId })
            .select();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return res.status(400).json({ message: 'Wallpaper already in this book' });
            }
            throw error;
        }

        res.status(201).json({ message: 'Wallpaper added to book successfully', data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeWallpaperFromBook = async (req, res) => {
    const { id: bookId, wallpaperId } = req.params;
    try {
        const { error } = await supabase
            .from('book_wallpapers')
            .delete()
            .eq('book_id', bookId)
            .eq('wallpaper_id', wallpaperId);

        if (error) throw error;
        res.status(200).json({ message: 'Wallpaper removed from book successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
