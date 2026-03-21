import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2).max(150),
  slug: z.string().min(2).max(200),
  imageUrl: z.string().url().optional(),
  description: z.string().optional(),
  parentId: z.string().uuid().optional().nullable().or(z.literal('')).transform(val => val === '' ? null : val),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();
