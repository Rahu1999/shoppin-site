import multer from 'multer';
import { Request } from 'express';
import path from 'path';
import crypto from 'crypto';
import { AppError } from '@utils/AppError';

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    cb(null, `${Date.now()}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new AppError('Only images (jpg, png, webp) are allowed', 400));
  },
});
