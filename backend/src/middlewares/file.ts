import multer from 'multer';
import path from 'path';
import fs from 'fs';

const TEMP_DIR = path.join(__dirname, '../tmp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

const fileMiddleware = multer({
  storage: multer.diskStorage({
    destination: (_, __, cb) => cb(null, TEMP_DIR),
    // уникальное, не пользовательское имя
    filename: (_, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // максимум 5 МБ
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Можно загружать только изображения'));
  },
});

export default fileMiddleware;
