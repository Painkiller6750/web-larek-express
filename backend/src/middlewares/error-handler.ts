import { NextFunction, Request, Response } from 'express';
import { Joi } from 'celebrate';
import { Error as MongooseError } from 'mongoose';

export default (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);

  if (err instanceof Joi.ValidationError) {
    return res.status(400).send({ message: err.message });
  }
  if (err instanceof MongooseError.ValidationError) {
    return res.status(400).send({ message: err.message });
  }
  if (err instanceof MongooseError.CastError) {
    return res.status(400).send({ message: `Некорректное значение в поле "${err.path}"` });
  }
  if (err instanceof Error && err.message.includes('E11000')) {
    return res.status(409).send({ message: 'Такой товар уже существует' });
  }

  const statusCode = typeof err === 'object' && err !== null && 'statusCode' in err
    ? (err as { statusCode: number }).statusCode
    : 500;
  const message = statusCode === 500
    ? 'На сервере произошла ошибка'
    : (err instanceof Error ? err.message : 'На сервере произошла ошибка');

  res.status(statusCode).send({ message });
};
