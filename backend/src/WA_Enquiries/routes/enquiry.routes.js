import { Router } from 'express';
import { getEnquiries, updateStatus, removeEnquiry } from '../controllers/enquiry.controller.js';

const router = Router();

router.get('/', getEnquiries);
router.put('/:id/status', updateStatus);
router.delete('/:id', removeEnquiry);

export default router;
