import { Router } from 'express';
import fileMiddleware from '../middlewares/file';
import uploadFile from '../controllers/upload';
import auth from '../middlewares/auth';

const uploadRouter = Router();

// POST /upload — загрузка файла во временную папку, только для авторизованных
uploadRouter.post('/', auth, fileMiddleware.single('file'), uploadFile);

export default uploadRouter;
