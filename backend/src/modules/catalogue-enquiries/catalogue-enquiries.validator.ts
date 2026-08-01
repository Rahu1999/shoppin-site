import { z } from 'zod';
import { EnquiryStatus } from '@entities/enquiry-status.enum';

export const createEnquirySchema = z.object({
  catalogueItemId: z.string().uuid().optional(),
  customerName: z.string().min(2).max(150),
  customerPhone: z.string().regex(/^[0-9+\-\s()]{7,20}$/, 'Enter a valid phone number'),
  customerEmail: z.string().email().optional(),
  message: z.string().min(5).max(1000),
});

export const updateEnquiryStatusSchema = z.object({
  status: z.nativeEnum(EnquiryStatus),
  adminNotes: z.string().max(1000).optional(),
});

export const getEnquiriesAdminQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.nativeEnum(EnquiryStatus).optional(),
  search: z.string().optional(),
});
