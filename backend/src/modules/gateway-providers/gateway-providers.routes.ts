import { Router } from 'express';
import { GatewayProvidersController } from './gateway-providers.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireAdmin } from '@middleware/role.middleware';

const router = Router();
const controller = new GatewayProvidersController();

router.get('/', controller.getAll);
router.patch('/:slug', authMiddleware, requireAdmin, controller.update);

export default router;
