import { Router } from 'express';
import { ProductsController } from './products.controller';
import { validate } from '@middleware/validate.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireAdmin } from '@middleware/role.middleware';
import { getProductsQuerySchema, createProductSchema, updateProductSchema } from './products.validator';

const router = Router();
const controller = new ProductsController();

// Public routes
router.get('/', validate(getProductsQuerySchema, 'query'), controller.getProducts);
router.get('/:slug', controller.getProduct);

// Admin routes
router.post(
  '/',
  authMiddleware,
  requireAdmin,
  validate(createProductSchema),
  controller.createProduct
);
router.patch(
  '/:id',
  authMiddleware,
  requireAdmin,
  validate(updateProductSchema),
  controller.updateProduct
);
router.delete('/:id', authMiddleware, requireAdmin, controller.deleteProduct);

export default router;
