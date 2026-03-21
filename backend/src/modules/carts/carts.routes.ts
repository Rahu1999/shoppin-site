import { Router } from 'express';
import { CartsController } from './carts.controller';
import { validate } from '@middleware/validate.middleware';
import { optionalAuth, authMiddleware } from '@middleware/auth.middleware';
import { addToCartSchema, updateCartItemSchema } from './carts.validator';

const router = Router();
const controller = new CartsController();

// Use optionalAuth so req.user is populated if token exists, otherwise allows guest x-session-id
router.use(optionalAuth);

router.get('/', controller.getMyCart);
router.post('/items', validate(addToCartSchema), controller.addItem);
router.patch('/items/:itemId', validate(updateCartItemSchema), controller.updateItem);
router.delete('/items/:itemId', controller.removeItem);
router.delete('/', controller.clearCart);

// Merge cart requires strict auth
router.post('/merge', authMiddleware, controller.mergeCart);

export default router;
