import express from 'express';
import { createUpscaleTask, getTaskStatus } from '../../controllers/ai/topazController.js';
import { verifyToken, isAdmin } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/upscale', verifyToken, isAdmin, createUpscaleTask);
router.get('/status', verifyToken, isAdmin, getTaskStatus);

export default router;
