import { z } from 'zod';

export const updateInventorySchema = z.object({
  quantity: z.number().int().min(0, "Quantity must be non-negative"),
  notes: z.string().optional(),
});
