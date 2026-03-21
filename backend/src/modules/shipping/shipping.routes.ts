import { Router } from 'express';
import { ShippingController } from './shipping.controller';
import { validate } from '@middleware/validate.middleware';
import { calculateShippingSchema } from './shipping.validator';

const router = Router();
const controller = new ShippingController();

router.get('/methods', controller.getMethods);
router.post('/estimate', validate(calculateShippingSchema), controller.estimateRates);

export default router;
