import { Router } from 'express';
import { PaymentsController } from './payments.controller';
import { validate } from '@middleware/validate.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import { processPaymentSchema, createRazorpayOrderSchema, verifyRazorpayPaymentSchema } from './payments.validator';

const router = Router({ mergeParams: true });
const controller = new PaymentsController();

// Razorpay routes — must be declared before /:orderId routes to avoid param collision
router.post('/razorpay/create-order', authMiddleware, validate(createRazorpayOrderSchema), controller.createRazorpayOrder);
router.post('/razorpay/verify', authMiddleware, validate(verifyRazorpayPaymentSchema), controller.verifyRazorpayPayment);

// COD / legacy
router.post('/orders/:orderId', authMiddleware, validate(processPaymentSchema), controller.processPayment);
router.post('/:orderId/process', authMiddleware, validate(processPaymentSchema), controller.processPayment);
router.get('/orders/:orderId', authMiddleware, controller.getPayments);

export default router;
