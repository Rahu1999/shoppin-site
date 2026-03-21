import { z } from 'zod';

export const getProductsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  sort: z.enum(['price', 'createdAt', 'name']).optional(),
  order: z.enum(['ASC', 'DESC']).optional(),
  isFeatured: z.string().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(2).max(300),
  slug: z.string().min(2).max(350),
  sku: z.string().max(100).optional().nullable(),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  basePrice: z.number().positive(),
  comparePrice: z.number().positive().optional().nullable(),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().optional().default(false),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  attributes: z.record(z.any()).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  images: z.array(z.string()).optional(),
  imageUrls: z.array(z.string()).optional(),
  stockQuantity: z.number().optional().default(0),
});

export const updateProductSchema = createProductSchema.partial();
