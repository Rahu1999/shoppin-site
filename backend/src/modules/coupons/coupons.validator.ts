import { z } from 'zod';
import { CouponType } from '@entities/coupon.entity';

export const createCouponSchema = z.object({
  code: z.string().min(3).max(50),
  type: z.nativeEnum(CouponType),
  value: z.number().positive(),
  minOrderValue: z.number().positive().optional().nullable(),
  maxDiscount: z.number().positive().optional().nullable(),
  usesLimit: z.number().int().positive().optional().nullable(),
  perUserLimit: z.number().int().positive().default(1),
  startsAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateCouponSchema = createCouponSchema.partial();
