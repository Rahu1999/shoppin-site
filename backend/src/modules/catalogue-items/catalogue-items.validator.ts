import { z } from 'zod';

const imageSchema = z.object({
  url: z.string().url(),
  isPrimary: z.boolean().optional().default(false),
});

export const createCatalogueItemSchema = z.object({
  name: z.string().min(2).max(300),
  slug: z.string().min(2).max(350),
  description: z.string().optional().nullable(),
  images: z.array(imageSchema).default([]),
  sizes: z.array(z.string()).default([]),
  categoryId: z.string().uuid().optional().nullable(),
  sourceProductId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().max(255).optional().nullable(),
});

export const updateCatalogueItemSchema = createCatalogueItemSchema.partial();

export const getCatalogueItemsAdminQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
});
