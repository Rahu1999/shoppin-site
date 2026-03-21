import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  avatarUrl: z.string().url().optional(),
});

export const createAddressSchema = z.object({
  type: z.enum(['shipping', 'billing']).default('shipping'),
  fullName: z.string().min(2).max(150),
  phone: z.string().min(5).max(20),
  line1: z.string().min(5).max(255),
  line2: z.string().max(255).optional(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  country: z.string().min(2).max(100),
  postalCode: z.string().min(3).max(20),
  isDefault: z.boolean().default(false),
});
