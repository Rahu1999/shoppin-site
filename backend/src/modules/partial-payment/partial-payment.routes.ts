import { Router } from 'express';
import { PartialPaymentController } from './partial-payment.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireAdmin } from '@middleware/role.middleware';

const router = Router();
const controller = new PartialPaymentController();

router.get('/config', controller.getConfig);
router.patch('/config', authMiddleware, requireAdmin, controller.updateConfig);

export default router;
