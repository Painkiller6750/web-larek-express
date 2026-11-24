import { NextFunction, Request, Response } from 'express';
import { Joi } from 'celebrate';
import { Error as MongooseError } from 'mongoose';
import { ApiError } from '../errors/api-error';

export default (err: Error, req: Request, res: Response, next: NextFunction) => {
  // ошибки валидации celebrate (joi) — приходят до контроллера
  if (err instanceof Joi.ValidationError) {
    return res.status(400).send({ message: err.message });
  }
  if (err instanceof ApiError) {
    return res.status(err.statusCode).send({ message: err.message });
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
  return res.status(500).send({ message: 'На сервере произошла ошибка' });
};
