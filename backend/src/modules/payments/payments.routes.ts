import { Router } from 'express';
import { PaymentsController } from './payments.controller';
import { validate } from '@middleware/validate.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import { processPaymentSchema, createRazorpayOrderSchema, verifyRazorpayPaymentSchema, createOrderSchema, verifyPaymentSchema } from './payments.validator';

const router = Router({ mergeParams: true });
const controller = new PaymentsController();

// Generic multi-gateway endpoints
router.post('/create-order', authMiddleware, validate(createOrderSchema), controller.createOrder);
router.post('/verify', authMiddleware, validate(verifyPaymentSchema), controller.verifyPayment);

// Razorpay-specific routes (backward compat — delegate to generic methods internally)
router.post('/razorpay/create-order', authMiddleware, validate(createRazorpayOrderSchema), controller.createRazorpayOrder);
router.post('/razorpay/verify', authMiddleware, validate(verifyRazorpayPaymentSchema), controller.verifyRazorpayPayment);

// COD / legacy
router.post('/orders/:orderId', authMiddleware, validate(processPaymentSchema), controller.processPayment);
router.post('/:orderId/process', authMiddleware, validate(processPaymentSchema), controller.processPayment);
router.get('/orders/:orderId', authMiddleware, controller.getPayments);

export default router;
