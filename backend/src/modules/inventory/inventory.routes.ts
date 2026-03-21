import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { validate } from '@middleware/validate.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireAdmin } from '@middleware/role.middleware';
import { updateInventorySchema } from './inventory.validator';

const router = Router();
const controller = new InventoryController();

router.use(authMiddleware, requireAdmin);

router.get('/', controller.getItems);
router.patch('/:id', validate(updateInventorySchema), controller.updateItem);
router.get('/:id/logs', controller.getLogs);

export default router;
