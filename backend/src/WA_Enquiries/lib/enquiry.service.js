import { supabase } from '../../config/supabase.js';

/**
 * Fetch enquiries.
 * @param {number} page 
 * @param {number} limit 
 * @param {string} search (by phone or design code or name)
 * @param {string} dateRange (e.g. '7d', '30d')
 */
export const fetchEnquiries = async (page = 1, limit = 50, search = '', startDate = null, endDate = null) => {
    const offset = (page - 1) * limit;

    let query = supabase
        .from('wa_enquiries')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

    if (search) {
        // PostgREST syntax for OR conditions
        query = query.or(`phone_number.ilike.%${search}%,design_code.ilike.%${search}%,name.ilike.%${search}%`);
    }

    if (startDate && endDate) {
        query = query.gte('created_at', startDate).lte('created_at', endDate);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return { data, count, page, limit };
};

/**
 * Update enquiry status.
 */
export const updateEnquiryStatus = async (id, status) => {
    const { data, error } = await supabase
        .from('wa_enquiries')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Delete enquiry.
 */
export const deleteEnquiry = async (id) => {
    const { error } = await supabase
        .from('wa_enquiries')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
};
