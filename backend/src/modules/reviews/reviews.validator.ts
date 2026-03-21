import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().min(10, 'Review must be at least 10 characters long'),
});
