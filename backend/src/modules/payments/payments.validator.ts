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

export const createRazorpayOrderSchema = z.object({
  orderId: z.string().uuid(),
});

export const verifyRazorpayPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  orderId: z.string().uuid(),
});

export const createOrderSchema = z.object({
  orderId: z.string().uuid(),
  gatewaySlug: z.string().min(1).optional(),
});

export const verifyPaymentSchema = z
  .object({
    orderId: z.string().uuid(),
    gatewaySlug: z.string().min(1),
    gatewayOrderId: z.string().min(1),
  })
  .passthrough();
