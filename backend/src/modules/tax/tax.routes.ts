import { Router } from 'express';
import { TaxController } from './tax.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireAdmin } from '@middleware/role.middleware';

const router = Router();
const controller = new TaxController();

// Public — frontend needs tax rate before user logs in (cart page)
router.get('/config', controller.getConfig);

// Admin only — update tax rate
router.patch('/config', authMiddleware, requireAdmin, controller.updateRate);

export default router;
