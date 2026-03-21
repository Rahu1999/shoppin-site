import { Router, Request } from 'express';
import { upload } from '../../middleware/upload.middleware';
import { successResponse } from '../../utils/apiResponse';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/role.middleware';

const router = Router();

router.post('/', authMiddleware, requireAdmin, upload.array('images', 5), (req: Request, res) => {
  const files = (req as any).files as any[];
  
  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded',
    });
  }

  // Generate full URLs
  const protocol = req.protocol;
  const host = req.get('host');
  const urls = files.map(file => `${protocol}://${host}/uploads/${file.filename}`);

  return successResponse(res, { urls }, 'Files uploaded successfully');
});

export default router;
