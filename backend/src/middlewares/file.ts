import { Request } from 'express';
import multer from 'multer';
import BadRequestError from '../errors/bad-request-error';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif'];

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: { mimetype: string },
  cb: multer.FileFilterCallback,
) => {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    return cb(null, true);
  }
  return cb(new BadRequestError('Допустимы только изображения (jpeg, png, gif)'));
};

const upload = multer({ storage, fileFilter });

export default upload;
