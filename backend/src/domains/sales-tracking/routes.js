import { Router } from 'express';
import { verifyToken, isAdmin } from '../../middlewares/authMiddleware.js';
import * as c from './controller.js';

const r = Router();

/* ==============================================================================
 * 1. AUTHENTICATION (Sales Boy Login)
 * ============================================================================== */
r.post('/auth/login', c.login);

/* ==============================================================================
 * 2. FIELD SALES MOBILE APP ROUTES (Protected: Sales Boy or Admin)
 * ============================================================================== */
r.get('/app/dashboard', verifyToken, c.getAppDashboard);
r.post('/app/visits', verifyToken, c.recordVisit);
r.get('/vendors', verifyToken, c.listVendors);
r.get('/vendors/:id/history', verifyToken, c.getVendorWithHistory);
r.get('/visits', verifyToken, c.listVisits);

/* ==============================================================================
 * 3. ADMIN MANAGEMENT ROUTES (Protected: Admin Only)
 * ============================================================================== */
// Analytics & Reporting
r.get('/admin/analytics', verifyToken, isAdmin, c.getAdminAnalytics);

// Zone Master
r.get('/admin/zones', verifyToken, isAdmin, c.listZones);
r.post('/admin/zones', verifyToken, isAdmin, c.createZone);
r.put('/admin/zones/:id', verifyToken, isAdmin, c.updateZone);
r.delete('/admin/zones/:id', verifyToken, isAdmin, c.deleteZone);

// Vendor Master
r.post('/admin/vendors', verifyToken, isAdmin, c.createVendor);
r.post('/admin/vendors/bulk', verifyToken, isAdmin, c.bulkCreateVendors);
r.put('/admin/vendors/:id', verifyToken, isAdmin, c.updateVendor);
r.delete('/admin/vendors/:id', verifyToken, isAdmin, c.deleteVendor);

// Sales Boys Management
r.get('/admin/sales-boys', verifyToken, isAdmin, c.listSalesBoys);
r.post('/admin/sales-boys', verifyToken, isAdmin, c.createSalesBoy);
r.put('/admin/sales-boys/:id', verifyToken, isAdmin, c.updateSalesBoy);

export default r;
