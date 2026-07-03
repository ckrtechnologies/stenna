import { supabase } from '../../config/supabase.js';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

/**
 * Process a CSV buffer and upsert the inventory into WA_Inventory table.
 * @param {Buffer} buffer - The uploaded CSV file buffer.
 * @returns {Promise<Object>} Results of the processing (success count, errors).
 */
export const processCSV = async (buffer) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const errors = [];
        
        // Convert buffer to readable stream for csv-parser
        const stream = Readable.from(buffer.toString());

        stream
            .pipe(csvParser())
            .on('data', (data) => {
                // Ensure columns exist and format properly
                // We expect design_code and quantity in the CSV
                // Normalizing keys to lowercase and replacing spaces with underscores
                const normalizedData = {};
                for (let key in data) {
                    const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_');
                    normalizedData[normalizedKey] = data[key];
                }

                const design_code = normalizedData['design_code'];
                const quantity = parseInt(normalizedData['quantity'], 10);

                if (design_code && !isNaN(quantity)) {
                    results.push({ design_code, quantity });
                } else {
                    errors.push({ row: data, error: 'Missing or invalid design_code or quantity' });
                }
            })
            .on('end', async () => {
                if (results.length === 0) {
                    return resolve({ success: 0, inserted: 0, updated: 0, failed: errors.length, errors, message: 'No valid rows found in CSV' });
                }

                try {
                    // Deduplicate results based on design_code to prevent Postgres 21000 error
                    const uniqueResultsMap = new Map();
                    results.forEach(item => {
                        uniqueResultsMap.set(item.design_code, item);
                    });
                    const uniqueResults = Array.from(uniqueResultsMap.values());

                    // Pre-check for existing design codes to count inserts vs updates
                    const designCodes = uniqueResults.map(r => r.design_code);
                    
                    // We split into smaller chunks (50) to avoid URI too long errors / 502 Bad Gateway in Supabase GET queries
                    const chunkSize = 50;
                    let existingCodes = new Set();
                    
                    for (let i = 0; i < designCodes.length; i += chunkSize) {
                        const chunk = designCodes.slice(i, i + chunkSize);
                        const { data: existingData, error: fetchError } = await supabase
                            .from('wa_inventory')
                            .select('design_code')
                            .in('design_code', chunk);
                            
                        if (fetchError) throw fetchError;
                        existingData.forEach(d => existingCodes.add(d.design_code));
                    }
                    
                    let insertedCount = 0;
                    let updatedCount = 0;
                    
                    uniqueResults.forEach(r => {
                        if (existingCodes.has(r.design_code)) {
                            updatedCount++;
                        } else {
                            insertedCount++;
                        }
                    });

                    // Bulk upsert to Supabase
                    const { data, error } = await supabase
                        .from('wa_inventory')
                        .upsert(uniqueResults, { onConflict: 'design_code' })
                        .select();

                    if (error) {
                        console.error('Supabase Upsert Error:', error);
                        return reject(error);
                    }

                    resolve({ 
                        success: data ? data.length : uniqueResults.length, 
                        inserted: insertedCount,
                        updated: updatedCount,
                        failed: errors.length,
                        errors, 
                        message: 'Bulk upload successful' 
                    });
                } catch (err) {
                    reject(err);
                }
            })
            .on('error', (err) => {
                reject(err);
            });
    });
};

/**
 * Fetch inventory items.
 * @param {number} page 
 * @param {number} limit 
 * @param {string} search
 */
export const fetchInventory = async (page = 1, limit = 50, search = '') => {
    const offset = (page - 1) * limit;

    let query = supabase
        .from('wa_inventory')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

    if (search) {
        query = query.ilike('design_code', `%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return { data, count, page, limit };
};

/**
 * Update a single inventory item.
 */
export const updateInventoryItem = async (id, updates) => {
    const { data, error } = await supabase
        .from('wa_inventory')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Delete a single inventory item.
 */
export const deleteInventoryItem = async (id) => {
    const { error } = await supabase
        .from('wa_inventory')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
};

/**
 * Bulk update quantities by ids.
 */
export const bulkUpdateInventory = async (ids, quantity) => {
    // Note: Supabase JS client doesn't natively support update multiple by array of IDs easily with different values,
    // but here we are setting the same quantity to multiple IDs.
    const { data, error } = await supabase
        .from('wa_inventory')
        .update({ quantity })
        .in('id', ids)
        .select();

    if (error) throw error;
    return data;
};
