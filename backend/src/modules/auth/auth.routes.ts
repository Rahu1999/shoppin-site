import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '@middleware/validate.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from './auth.validator';

const router = Router();
const controller = new AuthController();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshTokenSchema), controller.refresh);
router.post('/logout', authMiddleware, controller.logout);

export default router;
