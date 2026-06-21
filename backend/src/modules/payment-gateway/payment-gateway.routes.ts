import { Router } from 'express';
import { PaymentGatewayController } from './payment-gateway.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireAdmin } from '@middleware/role.middleware';

const router = Router();
const controller = new PaymentGatewayController();

router.get('/config', controller.getConfig);
router.patch('/config', authMiddleware, requireAdmin, controller.updateConfig);

export default router;
