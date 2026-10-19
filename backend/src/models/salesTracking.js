import { z } from 'zod';

/**
 * Pure Database Entity Schemas for Sales Tracking & Field Management Module
 * Matches public schema tables defined in migrations.
 * No HTTP/Route logic here — single source of truth for DB shapes.
 */

// 1. ZONES MASTER (`public.sales_zones`)
export const SalesZoneEntity = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional()
});

// 2. SALES BOYS (`public.sales_boys`)
export const SalesBoyEntity = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  phone: z.string().min(10).max(15),
  password_hash: z.string().min(1),
  is_active: z.boolean().default(true),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional()
});

// 3. SALES BOY <-> ZONES JUNCTION (`public.sales_boy_zones`)
export const SalesBoyZoneEntity = z.object({
  sales_boy_id: z.string().uuid(),
  zone_id: z.string().uuid()
});

// 4. VENDORS / SHOPS MASTER (`public.sales_vendors`)
export const SalesVendorEntity = z.object({
  id: z.string().uuid(),
  zone_id: z.string().uuid().nullable().optional(),
  shop_name: z.string().min(1).max(255),
  phone: z.string().min(10).max(15),
  shop_address: z.string().min(1),
  contact_person: z.string().min(1).max(255),
  is_active: z.boolean().default(true),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional()
});

// 5. FIELD VISIT RECORDS (`public.sales_visits`)
export const SalesVisitEntity = z.object({
  id: z.string().uuid(),
  sales_boy_id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  is_available: z.boolean().default(true),
  comments: z.string().nullable().optional(),
  visited_at: z.union([z.string(), z.date()]).optional(),
  created_at: z.union([z.string(), z.date()]).optional()
});

// 6. VISIT <-> BOOKS TRACKER (`public.sales_visit_books`)
export const SalesVisitBookEntity = z.object({
  id: z.string().uuid(),
  visit_id: z.string().uuid(),
  book_id: z.string().uuid(),
  action_type: z.enum(['shown', 'bought']),
  created_at: z.union([z.string(), z.date()]).optional()
});
