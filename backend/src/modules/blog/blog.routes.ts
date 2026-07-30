import { Router } from 'express';
import { BlogController } from './blog.controller';
import { validate } from '@middleware/validate.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireAdmin } from '@middleware/role.middleware';
import {
  createBlogPostSchema,
  updateBlogPostSchema,
  getBlogQuerySchema,
  getBlogAdminQuerySchema,
} from './blog.validator';

const router = Router();
const controller = new BlogController();

router.get('/admin/all', authMiddleware, requireAdmin, validate(getBlogAdminQuerySchema, 'query'), controller.getAllAdmin);
router.get('/admin/:id', authMiddleware, requireAdmin, controller.getOneAdmin);

router.get('/', validate(getBlogQuerySchema, 'query'), controller.getPublished);
router.get('/:slug', controller.getPublishedOne);

router.post('/', authMiddleware, requireAdmin, validate(createBlogPostSchema), controller.create);
router.patch('/:id', authMiddleware, requireAdmin, validate(updateBlogPostSchema), controller.update);
router.delete('/:id', authMiddleware, requireAdmin, controller.delete);

export default router;
