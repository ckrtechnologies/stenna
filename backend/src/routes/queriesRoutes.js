import express from 'express';
import { getUserLeads } from '../controllers/leadController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getUserLeads);

export default router;
