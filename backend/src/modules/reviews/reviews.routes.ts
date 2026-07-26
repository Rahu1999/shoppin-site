import { Router } from 'express';
import { ReviewsController } from './reviews.controller';
import { validate } from '@middleware/validate.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireAdmin } from '@middleware/role.middleware';
import { createReviewSchema } from './reviews.validator';

const router = Router();
const controller = new ReviewsController();

router.get('/product/:productId', controller.getProductReviews);
router.get('/eligibility/:productId', authMiddleware, controller.getReviewEligibility);
router.get('/mine', authMiddleware, controller.getMyReviewedProductIds);
router.get('/admin/pending', authMiddleware, requireAdmin, controller.getPendingReviews);
router.post('/', authMiddleware, validate(createReviewSchema), controller.createReview);
router.patch('/admin/:id/approve', authMiddleware, requireAdmin, controller.approveReview);
router.delete('/:id', authMiddleware, requireAdmin, controller.deleteReview);

export default router;
