import express from 'express';
import { generatePDF, downloadPDF, getResizedImage } from '../controllers/pdfController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected admin endpoint for rendering high-fidelity PDF via headless Puppeteer
router.post('/generate', verifyToken, isAdmin, generatePDF);

// Publicly accessible download endpoint for secure randomized single-use tokens
router.get('/download/:token', downloadPDF);

// Route for on-the-fly image resizing/compression during PDF compiling
router.get('/image', getResizedImage);

export default router;
