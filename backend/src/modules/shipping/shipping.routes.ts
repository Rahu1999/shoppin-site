import { Router } from 'express';
import { ShippingController } from './shipping.controller';
import { validate } from '@middleware/validate.middleware';
import { calculateShippingSchema } from './shipping.validator';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireAdmin } from '@middleware/role.middleware';

const router = Router();
const controller = new ShippingController();

router.get('/methods', controller.getMethods);
router.post('/estimate', validate(calculateShippingSchema), controller.estimateRates);

// Dynamic config — public read, admin write
router.get('/config', controller.getConfig);
router.patch('/config', authMiddleware, requireAdmin, controller.updateConfig);

export default router;
