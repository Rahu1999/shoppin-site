import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { CatalogueEnquiriesController } from './catalogue-enquiries.controller';
import { validate } from '@middleware/validate.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireAdmin } from '@middleware/role.middleware';
import {
  createEnquirySchema,
  updateEnquiryStatusSchema,
  getEnquiriesAdminQuerySchema,
} from './catalogue-enquiries.validator';

const router = Router();
const controller = new CatalogueEnquiriesController();

// Public, unauthenticated write endpoint — keep spam under control
const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many enquiries submitted, please try again later.', errorCode: 'RATE_LIMITED' },
});

router.get('/admin/all', authMiddleware, requireAdmin, validate(getEnquiriesAdminQuerySchema, 'query'), controller.getAllAdmin);
router.patch('/admin/:id/status', authMiddleware, requireAdmin, validate(updateEnquiryStatusSchema), controller.updateStatus);

router.post('/', enquiryLimiter, validate(createEnquirySchema), controller.create);

export default router;
