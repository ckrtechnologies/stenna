import express from 'express';
import { uploadRoom, applyWallpaper, getHistory, generateVisualization, editVisualization } from '../controllers/visualizerController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/upload-room', verifyToken, upload.single('roomImage'), uploadRoom);
router.post('/generate', verifyToken, upload.single('roomImage'), generateVisualization);
router.post('/apply', verifyToken, applyWallpaper);
router.patch('/edit/:id', verifyToken, editVisualization);
router.get('/history', verifyToken, getHistory);

export default router;
