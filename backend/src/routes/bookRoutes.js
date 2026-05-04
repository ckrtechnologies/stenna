import express from 'express';
import {
    createBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook,
    addWallpaperToBook,
    bulkAddWallpapersToBook,
    removeWallpaperFromBook
} from '../controllers/bookController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, isAdmin, createBook);
router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.put('/:id', verifyToken, isAdmin, updateBook);
router.delete('/:id', verifyToken, isAdmin, deleteBook);

router.post('/:id/wallpapers', verifyToken, isAdmin, addWallpaperToBook);
router.post('/wallpapers/bulk', verifyToken, isAdmin, bulkAddWallpapersToBook);
router.post('/:id/wallpapers/bulk', verifyToken, isAdmin, bulkAddWallpapersToBook);
router.delete('/:id/wallpapers/:wallpaperId', verifyToken, isAdmin, removeWallpaperFromBook);

export default router;
