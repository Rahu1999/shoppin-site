import { z } from 'zod';

export const manageWishlistSchema = z.object({
  productId: z.string().uuid(),
});
