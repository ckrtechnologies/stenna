import { z } from 'zod';

/**
 * Pure Database Entity Schema for `public.books`
 * Single Pane of Glass - No HTTP/Request logic.
 */
export const BookEntity = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  created_at: z.union([z.string(), z.date()]).optional()
});
