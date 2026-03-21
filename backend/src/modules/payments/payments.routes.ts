import { Router } from 'express';
import { PaymentsController } from './payments.controller';
import { validate } from '@middleware/validate.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import { processPaymentSchema } from './payments.validator';

const router = Router({ mergeParams: true }); // Allows passing orderId from parent routers if mounted dynamically
const controller = new PaymentsController();

router.post('/orders/:orderId', authMiddleware, validate(processPaymentSchema), controller.processPayment);
router.post('/:orderId/process', authMiddleware, validate(processPaymentSchema), controller.processPayment); // Alias for frontend
router.get('/orders/:orderId', authMiddleware, controller.getPayments);

export default router;
