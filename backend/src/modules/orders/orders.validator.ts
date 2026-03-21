import { z } from 'zod';

export const checkoutSchema = z.object({
  shippingAddressId: z.string().uuid().optional(), // if using saved address
  shippingAddress: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(5),
    line1: z.string().min(5),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    country: z.string().min(2),
    postalCode: z.string().min(3),
  }).optional(),
  billingAddress: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(5),
    line1: z.string().min(5),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    country: z.string().min(2),
    postalCode: z.string().min(3),
  }).optional(),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => {
  return data.shippingAddressId || data.shippingAddress;
}, {
  message: "Either shippingAddressId or shippingAddress object must be provided",
  path: ["shippingAddress"]
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
  notes: z.string().optional(),
});
