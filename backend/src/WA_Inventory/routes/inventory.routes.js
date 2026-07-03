import express from 'express';
import { uploadBulkInventory, getInventory, updateItem, deleteItem, bulkUpdate } from '../controllers/inventory.controller.js';
import { upload } from '../utils/upload.middleware.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware to check if the user is a WA_InventoryManager or admin
const restrictToInventoryManager = (req, res, next) => {
    if (req.user && (req.user.role === 'WA_InventoryManager' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden: Requires WA_InventoryManager or admin role' });
    }
};

// GET /api/wa-inventory - Fetch inventory (Protected for managers/admins)
router.get('/', verifyToken, restrictToInventoryManager, getInventory);

// POST /api/wa-inventory/bulk-upload - Upload CSV (Protected)
router.post('/bulk-upload', verifyToken, restrictToInventoryManager, upload.single('file'), uploadBulkInventory);

// PUT /api/wa-inventory/bulk-update - Bulk Update (Protected)
router.post('/bulk-update', verifyToken, restrictToInventoryManager, bulkUpdate);

// PUT /api/wa-inventory/:id - Update Single Item (Protected)
router.put('/:id', verifyToken, restrictToInventoryManager, updateItem);

// DELETE /api/wa-inventory/:id - Delete Single Item (Protected)
router.delete('/:id', verifyToken, restrictToInventoryManager, deleteItem);


export default router;
