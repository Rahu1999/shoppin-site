import { z } from 'zod';

export const calculateShippingSchema = z.object({
  country: z.string().min(2),
  state: z.string().optional(),
  cartValue: z.number().nonnegative(),
  weight: z.number().nonnegative().optional().default(0),
});
