import { Request, Response, NextFunction } from 'express';
import BadRequestError from '../errors/bad-request-error';

const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new BadRequestError('Файл не передан'));
  }
  return res.send({ fileName: `/images/${req.file.originalname}` });
};

export default uploadFile;
