import express from 'express';
import { uploadWallpaper, deleteFile } from '../controllers/uploadController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/wallpaper', verifyToken, isAdmin, upload.single('image'), uploadWallpaper);
router.delete('/file', verifyToken, isAdmin, deleteFile);

export default router;
