import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

// --- Dealer CRUD ---

export const createDealer = async (req, res) => {
    const { email, password, name, phone, address, is_active } = req.body;
    try {
        // Check if dealer already exists
        const { data: existingDealer } = await supabase
            .from('dealers')
            .select('id')
            .eq('email', email)
            .single();

        if (existingDealer) {
            return res.status(400).json({ message: 'Dealer with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { data, error } = await supabase
            .from('dealers')
            .insert({
                email,
                password: hashedPassword,
                name,
                phone,
                address,
                is_active: is_active !== undefined ? is_active : true
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: 'Dealer created successfully', data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllDealers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('dealers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDealerById = async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('dealers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(404).json({ message: 'Dealer not found' });
    }
};

export const updateDealer = async (req, res) => {
    const { id } = req.params;
    const { name, phone, address, is_active, password } = req.body;

    try {
        const updateData = { name, phone, address, is_active };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const { data, error } = await supabase
            .from('dealers')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json({ message: 'Dealer updated successfully', data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleDealerStatus = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body; // Expect boolean
    try {
        const { data, error } = await supabase
            .from('dealers')
            .update({ is_active })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json({ message: `Dealer ${is_active ? 'activated' : 'deactivated'} successfully`, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteDealer = async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('dealers')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Dealer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Dealer Books Assignment ---

export const assignBookToDealer = async (req, res) => {
    const { dealerId } = req.params;
    const { bookId } = req.body;
    try {
        const { data, error } = await supabase
            .from('dealer_books')
            .insert({ dealer_id: dealerId, book_id: bookId })
            .select();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return res.status(400).json({ message: 'Book already assigned to this dealer' });
            }
            throw error;
        }
        res.status(201).json({ message: 'Book assigned successfully', data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const bulkAssignBooksToDealer = async (req, res) => {
    const { dealerId } = req.params;
    const { bookIds } = req.body; // Array of bookIds
    try {
        const inserts = bookIds.map(bookId => ({
            dealer_id: dealerId,
            book_id: bookId
        }));

        const { data, error } = await supabase
            .from('dealer_books')
            .upsert(inserts, { onConflict: 'dealer_id, book_id', ignoreDuplicates: true })
            .select();

        if (error) throw error;
        res.status(201).json({ message: 'Books assigned successfully', data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeBookFromDealer = async (req, res) => {
    const { dealerId, bookId } = req.params;
    try {
        const { error } = await supabase
            .from('dealer_books')
            .delete()
            .eq('dealer_id', dealerId)
            .eq('book_id', bookId);

        if (error) throw error;
        res.status(200).json({ message: 'Book removed from dealer successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDealerBooks = async (req, res) => {
    const { dealerId } = req.params;
    try {
        const { data, error } = await supabase
            .from('dealer_books')
            .select(`
                *,
                book:books(*)
            `)
            .eq('dealer_id', dealerId);

        if (error) throw error;

        // Flatten
        const books = data.map(item => item.book);
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyBooks = async (req, res) => {
    const dealerId = req.user?.id;

    if (!dealerId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const { data, error } = await supabase
            .from('dealer_books')
            .select(`
                *,
                book:books(*)
            `)
            .eq('dealer_id', dealerId);

        if (error) throw error;

        const books = data.map(item => item.book);
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
