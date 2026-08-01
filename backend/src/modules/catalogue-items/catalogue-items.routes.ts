import { Router } from 'express';
import { CatalogueItemsController } from './catalogue-items.controller';
import { validate } from '@middleware/validate.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireAdmin } from '@middleware/role.middleware';
import {
  createCatalogueItemSchema,
  updateCatalogueItemSchema,
  getCatalogueItemsAdminQuerySchema,
} from './catalogue-items.validator';

const router = Router();
const controller = new CatalogueItemsController();

router.get('/admin/all', authMiddleware, requireAdmin, validate(getCatalogueItemsAdminQuerySchema, 'query'), controller.getAllAdmin);

router.get('/', controller.getPublic);
router.get('/:slug', controller.getPublicOne);

router.post('/', authMiddleware, requireAdmin, validate(createCatalogueItemSchema), controller.create);
router.patch('/:id', authMiddleware, requireAdmin, validate(updateCatalogueItemSchema), controller.update);
router.delete('/:id', authMiddleware, requireAdmin, controller.delete);

export default router;
