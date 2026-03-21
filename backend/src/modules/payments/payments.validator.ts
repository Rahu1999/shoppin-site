import { z } from 'zod';

export const processPaymentSchema = z.object({
  paymentMethod: z.string().min(2),
  providerToken: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().length(3).default('INR'),
});

export const refundPaymentSchema = z.object({
  amount: z.number().positive().optional(),
  reason: z.string().optional(),
});
