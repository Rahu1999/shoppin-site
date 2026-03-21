import { Router } from 'express';
import { CategoriesController } from './categories.controller';
import { validate } from '@middleware/validate.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireAdmin } from '@middleware/role.middleware';
import { createCategorySchema, updateCategorySchema } from './categories.validator';

const router = Router();
const controller = new CategoriesController();

router.get('/tree', controller.getTree);
router.get('/:slug', controller.getOne);

router.post('/', authMiddleware, requireAdmin, validate(createCategorySchema), controller.create);
router.patch('/:id', authMiddleware, requireAdmin, validate(updateCategorySchema), controller.update);
router.delete('/:id', authMiddleware, requireAdmin, controller.delete);

export default router;
