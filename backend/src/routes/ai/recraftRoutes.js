import express from 'express';
import { createCrispUpscaleTask } from '../../controllers/ai/recraftController.js';
import { getTaskStatus } from '../../controllers/ai/topazController.js'; // Using unified status controller
import { verifyToken, isAdmin } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/crisp-upscale', verifyToken, isAdmin, createCrispUpscaleTask);
router.get('/status', verifyToken, isAdmin, getTaskStatus);

export default router;
