import { uploadWallpaper, deleteFile, uploadWallpaperToVPS, verifyVPS, uploadContentToVPS } from '../controllers/uploadController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';
import express from 'express';

const router = express.Router();

router.post('/wallpaper', verifyToken, isAdmin, upload.single('image'), uploadWallpaper);
router.post('/n8n-direct', upload.single('image'), uploadWallpaperToVPS);
router.post('/content', verifyToken, isAdmin, upload.single('image'), uploadContentToVPS);
router.get('/verify-vps', verifyToken, isAdmin, verifyVPS);
router.delete('/file', verifyToken, isAdmin, deleteFile);

export default router;
