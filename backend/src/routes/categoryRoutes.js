import express from 'express';
import { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory, bulkAddWallpapersToCategory } from '../controllers/categoryController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', verifyToken, isAdmin, createCategory);
router.post('/wallpapers/bulk', verifyToken, isAdmin, bulkAddWallpapersToCategory);
router.post('/:id/wallpapers/bulk', verifyToken, isAdmin, bulkAddWallpapersToCategory);
router.put('/:id', verifyToken, isAdmin, updateCategory);
router.delete('/:id', verifyToken, isAdmin, deleteCategory);

export default router;
