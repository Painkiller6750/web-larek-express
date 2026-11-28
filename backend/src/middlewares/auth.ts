import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import UnauthorizedError from '../errors/unauthorized-error';
import { JWT_SECRET } from '../config';

const auth = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  let payload: { _id: string };
  try {
    payload = jwt.verify(token, JWT_SECRET) as { _id: string };
  } catch {
    return next(new UnauthorizedError('Токен просрочен или невалиден'));
  }

  (req as Request & { user?: { _id: string } }).user = { _id: payload._id };
  return next();
};

export default auth;
