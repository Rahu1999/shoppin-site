import { Router } from 'express';
import { OrdersController } from './orders.controller';
import { validate } from '@middleware/validate.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireAdmin } from '@middleware/role.middleware';
import { checkoutSchema, updateOrderStatusSchema } from './orders.validator';

const router = Router();
const controller = new OrdersController();

// User Routes
router.post('/checkout', authMiddleware, validate(checkoutSchema), controller.checkout);
router.post('/', authMiddleware, validate(checkoutSchema), controller.checkout); // Alias for frontend
router.get('/', authMiddleware, controller.getMyOrders);
router.get('/:id', authMiddleware, controller.getMyOrder);

// Admin Routes
router.get('/admin/all', authMiddleware, requireAdmin, controller.getAllOrders);
router.get('/admin/:id', authMiddleware, requireAdmin, controller.getOrderAsAdmin);
router.patch('/admin/:id/status', authMiddleware, requireAdmin, validate(updateOrderStatusSchema), controller.updateStatus);

export default router;
