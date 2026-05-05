import express from 'express';
import { getRecommendations, getKieCredits } from '../controllers/aiController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

// Modular Routers
import topazRoutes from './ai/topazRoutes.js';
import recraftRoutes from './ai/recraftRoutes.js';

const router = express.Router();

// Base AI Routes
router.post('/recommendations', getRecommendations);
router.get('/credits', verifyToken, isAdmin, getKieCredits);

// Mounted Modular Routes
router.use('/topaz', topazRoutes);
router.use('/recraft', recraftRoutes);

export default router;

