import { Router } from 'express';
import { CouponsController } from './coupons.controller';
import { validate } from '@middleware/validate.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireAdmin } from '@middleware/role.middleware';
import { createCouponSchema, updateCouponSchema } from './coupons.validator';

const router = Router();
const controller = new CouponsController();

// Public / Authenticated user endpoint for checkout validation
router.post('/validate', authMiddleware, controller.validate);

// Admin routes
router.use(authMiddleware, requireAdmin);
router.get('/', controller.getAdminCoupons);
router.post('/', validate(createCouponSchema), controller.create);
router.patch('/:id', validate(updateCouponSchema), controller.update);
router.delete('/:id', controller.delete);

export default router;
