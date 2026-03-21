import { Router } from 'express';
import { WishlistsController } from './wishlists.controller';
import { validate } from '@middleware/validate.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import { manageWishlistSchema } from './wishlists.validator';

const router = Router();
const controller = new WishlistsController();

router.use(authMiddleware); // All wishlist routes require login

router.get('/', controller.getMyWishlist);
router.post('/toggle', validate(manageWishlistSchema), controller.toggleItem);
router.delete('/', controller.clearWishlist);

export default router;
