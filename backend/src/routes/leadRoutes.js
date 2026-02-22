import express from 'express';
import { getAllLeads, createLead, updateLeadStatus } from '../controllers/leadController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, isAdmin, getAllLeads);
router.post('/', createLead);
router.patch('/:id/status', verifyToken, isAdmin, updateLeadStatus);
router.patch('/:id', verifyToken, isAdmin, updateLeadStatus);

export default router;
