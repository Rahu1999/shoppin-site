import { Router } from 'express';
import { ReviewsController } from './reviews.controller';
import { validate } from '@middleware/validate.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireAdmin } from '@middleware/role.middleware';
import { createReviewSchema } from './reviews.validator';

const router = Router();
const controller = new ReviewsController();

router.get('/product/:productId', controller.getProductReviews);
router.post('/', authMiddleware, validate(createReviewSchema), controller.createReview);
router.delete('/:id', authMiddleware, requireAdmin, controller.deleteReview);

export default router;
