import { z } from 'zod';
import {
  SalesZoneEntity,
  SalesMarketEntity,
  SalesBoyEntity,
  SalesVendorEntity,
  SalesVisitEntity,
  SalesVisitBookEntity
} from '../../models/index.js';

/* ==============================================================================
 * 1. STRICT DTOs (Passed from Service to Repository only)
 * Prevents unauthorized ID, timestamp, or arbitrary column injection.
 * ============================================================================== */

export const CreateZoneDTO = SalesZoneEntity.omit({
  id: true,
  created_at: true,
  updated_at: true
});
export const UpdateZoneDTO = CreateZoneDTO.partial();

export const CreateMarketDTO = SalesMarketEntity.omit({
  id: true,
  created_at: true,
  updated_at: true
});
export const UpdateMarketDTO = CreateMarketDTO.partial();

export const CreateSalesBoyDTO = SalesBoyEntity.omit({
  id: true,
  created_at: true,
  updated_at: true
});
export const UpdateSalesBoyDTO = CreateSalesBoyDTO.partial();

export const CreateVendorDTO = SalesVendorEntity.omit({
  id: true,
  created_at: true,
  updated_at: true
});
export const UpdateVendorDTO = CreateVendorDTO.partial();

export const InsertVisitDTO = SalesVisitEntity.omit({
  id: true,
  created_at: true
});

export const InsertVisitBookDTO = SalesVisitBookEntity.omit({
  id: true,
  created_at: true
});

/* ==============================================================================
 * 2. HTTP ENDPOINT REQUEST SCHEMAS (Validated in Controller)
 * ============================================================================== */

// Helper to format clean human-friendly validation error messages
export function formatZodError(error) {
  if (!error || !error.errors) return error?.message || 'Validation failed';
  return error.errors
    .map((err) => {
      const field = err.path && err.path.length > 0 ? `'${err.path.join('.')}'` : 'object';
      return `${field}: ${err.message}`;
    })
    .join('; ');
}

// Sales Rep Phone + Password Auth
export const salesBoyLoginBody = z.object({
  phone: z.string().min(10).max(15),
  password: z.string().min(4)
}).strict();

// Admin: Zone Master
export const createZoneBody = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  is_active: z.boolean().optional()
}).strict();

export const updateZoneBody = createZoneBody.partial();

// Admin: Market Master (Zone > Market > Shop)
export const createMarketBody = z.object({
  zoneId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  is_active: z.boolean().optional()
}).strict();

export const updateMarketBody = createMarketBody.partial();

// Admin: Vendor Master
export const createVendorBody = z.object({
  shopName: z.string().min(1).max(255),
  phone: z.string().min(10).max(15),
  shopAddress: z.string().min(1),
  contactPerson: z.string().min(1).max(255),
  zoneId: z.string().uuid().optional().nullable(),
  marketId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional(),
  is_active: z.boolean().optional()
}).strict();

export const updateVendorBody = createVendorBody.partial();

export const bulkCreateVendorsBody = z.object({
  vendors: z.array(z.record(z.any())).min(1).max(2000),
  defaultZoneId: z.string().uuid().optional().nullable(),
  defaultMarketId: z.string().uuid().optional().nullable()
});

// Admin: Sales Boy Management
export const createSalesBoyBody = z.object({
  name: z.string().min(1).max(255),
  phone: z.string().min(10).max(15),
  password: z.string().min(4),
  zoneIds: z.array(z.string().uuid()).default([]),
  isActive: z.boolean().optional(),
  is_active: z.boolean().optional()
}).strict();

export const updateSalesBoyBody = z.object({
  name: z.string().min(1).max(255).optional(),
  phone: z.string().min(10).max(15).optional(),
  password: z.string().min(4).optional(),
  isActive: z.boolean().optional(),
  is_active: z.boolean().optional(),
  zoneIds: z.array(z.string().uuid()).optional()
}).strict();

// Sales Boy / App: Field Visit Record Logging
export const recordVisitBody = z.object({
  vendorId: z.string().uuid(),
  isAvailable: z.boolean().default(true),
  comments: z.string().optional().nullable(),
  booksShown: z.array(z.string().uuid()).default([]),
  booksBought: z.array(z.string().uuid()).default([])
}).strict();

