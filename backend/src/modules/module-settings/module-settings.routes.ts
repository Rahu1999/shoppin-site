import { Router } from 'express';
import { ModuleSettingsController } from './module-settings.controller';
import { validate } from '@middleware/validate.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireAdmin } from '@middleware/role.middleware';
import { updateModuleSettingSchema } from './module-settings.validator';

const router = Router();
const controller = new ModuleSettingsController();

router.get('/admin', authMiddleware, requireAdmin, controller.getAllAdmin);
router.patch('/admin/:moduleKey', authMiddleware, requireAdmin, validate(updateModuleSettingSchema), controller.update);

router.get('/public', controller.getPublicFlags);

export default router;
