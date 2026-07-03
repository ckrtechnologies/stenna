import { processCSV, fetchInventory, updateInventoryItem, deleteInventoryItem, bulkUpdateInventory } from '../lib/inventory.service.js';

/**
 * Controller to handle bulk upload of CSV for WA Inventory.
 */
export const uploadBulkInventory = async (req, res) => {
    try {
        // Optional: Assuming req.user is set by authMiddleware
        // if (!req.user || req.user.role !== 'WA_InventoryManager') {
        //     return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
        // }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded. Please upload a CSV file.' });
        }

        const result = await processCSV(req.file.buffer);

        res.status(200).json({
            message: 'Bulk upload processed successfully',
            data: result
        });
    } catch (error) {
        console.error('Error in uploadBulkInventory:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

/**
 * Controller to fetch WA inventory with pagination and search.
 */
export const getInventory = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 50;
        const search = req.query.search || '';

        const result = await fetchInventory(page, limit, search);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in getInventory:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
};

/**
 * Update single inventory item.
 */
export const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body; // e.g. { quantity: 10 }
        
        const data = await updateInventoryItem(id, updates);
        res.status(200).json({ message: 'Updated successfully', data });
    } catch (error) {
        console.error('Error in updateItem:', error);
        res.status(500).json({ error: 'Failed to update item' });
    }
};

/**
 * Delete single inventory item.
 */
export const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteInventoryItem(id);
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete item' });
    }
};

/**
 * Bulk update inventory items.
 */
export const bulkUpdate = async (req, res) => {
    try {
        const { ids, quantity } = req.body;
        if (!ids || !ids.length || quantity === undefined) {
            return res.status(400).json({ error: 'Missing ids or quantity' });
        }
        const data = await bulkUpdateInventory(ids, quantity);
        res.status(200).json({ message: 'Bulk updated successfully', data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to bulk update items' });
    }
};
