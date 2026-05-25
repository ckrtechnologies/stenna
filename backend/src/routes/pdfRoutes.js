import express from 'express';
import { generatePDF } from '../controllers/pdfController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected admin endpoint for rendering high-fidelity PDF via headless Puppeteer
router.post('/generate', verifyToken, isAdmin, generatePDF);

export default router;
