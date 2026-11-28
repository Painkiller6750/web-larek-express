import { NextFunction, Request, Response } from 'express';
import { Joi } from 'celebrate';
import { Error as MongooseError } from 'mongoose';

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    return next(err);
  }
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
    return res.status(409).send({ message: 'Такая запись уже существует' });
  }

  let statusCode = 500;
  if (typeof err === 'object' && err !== null && 'statusCode' in err) {
    statusCode = (err as { statusCode: number }).statusCode;
  }

  let message = 'На сервере произошла ошибка';
  if (statusCode !== 500 && err instanceof Error) {
    message = err.message;
  }

  return res.status(statusCode).send({ message });
};

export default errorHandler;
