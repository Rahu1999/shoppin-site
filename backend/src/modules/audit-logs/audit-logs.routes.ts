import { Router } from 'express';
import { AuditLogsController } from './audit-logs.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireAdmin } from '@middleware/role.middleware';

const router = Router();
const controller = new AuditLogsController();

router.use(authMiddleware, requireAdmin);

router.get('/', controller.getLogs);

export default router;
