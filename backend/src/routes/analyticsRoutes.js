import { trackEvent, getPopular, getDashboardStats } from '../controllers/analyticsController.js';
import express from 'express';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', trackEvent);
router.get('/popular', verifyToken, isAdmin, getPopular);
router.get('/dashboard-stats', verifyToken, isAdmin, getDashboardStats);

export default router;
