import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../errors/unauthorized-error';
import { verifyToken } from '../utils/jwt';

// расширяем тип Request, чтобы TS знал про req.user
export interface RequestWithUser extends Request {
  user?: { _id: string };
}

export default (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }
  try {
    (req as RequestWithUser).user = verifyToken(authHeader.replace('Bearer ', ''));
    next();
  } catch {
    next(new UnauthorizedError('Токен просрочен или невалиден'));
  }
};
