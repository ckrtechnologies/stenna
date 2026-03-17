import express from 'express';
import {
    getAllWallpapers,
    getWallpaperBySlug,
    createWallpaper,
    updateWallpaper,
    deleteWallpaper,
    toggleStatus,
    bulkUpdateQuantity,
    bulkCreateWallpapers
} from '../controllers/wallpaperController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getAllWallpapers);
router.get('/slug/:slug', getWallpaperBySlug);
router.post('/', verifyToken, isAdmin, createWallpaper);
router.post('/bulk-upload', verifyToken, isAdmin, bulkCreateWallpapers);
router.post('/bulk-update-quantity', verifyToken, isAdmin, upload.single('file'), bulkUpdateQuantity);
router.put('/:id', verifyToken, isAdmin, updateWallpaper);
router.delete('/:id', verifyToken, isAdmin, deleteWallpaper);
router.patch('/:id/status', verifyToken, isAdmin, toggleStatus);

export default router;
