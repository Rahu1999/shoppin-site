import { Router } from 'express';
import { UsersController } from './users.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { validate } from '@middleware/validate.middleware';
import { updateProfileSchema, createAddressSchema } from './users.validator';

const router = Router();
const controller = new UsersController();

// All routes require authentication
router.use(authMiddleware);

router.get('/me', controller.getMe);
router.patch('/me', validate(updateProfileSchema), controller.updateMe);

router.get('/addresses', controller.getAddresses);
router.post('/addresses', validate(createAddressSchema), controller.addAddress);
router.patch('/addresses/:id', validate(createAddressSchema.partial()), controller.updateAddress);
router.delete('/addresses/:id', controller.removeAddress);

// Admin Routes
import { requireAdmin } from '@middleware/role.middleware';
router.get('/', requireAdmin, controller.getUsers);
router.patch('/:id', requireAdmin, controller.updateUser);
router.delete('/:id', requireAdmin, controller.deleteUser);

export default router;
