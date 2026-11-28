import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import ms from 'ms';
import mongoose from 'mongoose';
import User from '../models/user';
import BadRequestError from '../errors/bad-request-error';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';
import ConflictError from '../errors/conflict-error';
import { createTokens, verifyToken } from '../utils/jwt';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: false,
  maxAge: ms((process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d') as ms.StringValue),
  path: '/',
};

const sendTokens = (res: Response, user: { _id: string; email: string; name: string }) => {
  const { accessToken, refreshToken } = createTokens(String(user._id));
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  res.send({ user: { email: user.email, name: user.name }, success: true, accessToken });
};

// POST /auth/register
export const register = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  User.create({ name, email, password })
    .then((user) => sendTokens(res, user))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError(`Некорректные данные: ${err.message}`));
      }
      if (err instanceof Error && err.message.includes('E11000')) {
        return next(new ConflictError('Пользователь с таким email уже существует'));
      }
      return next(err);
    });
};

// POST /auth/login
export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .select('+password +tokens')
    .then((user) => {
      if (!user) {
        return next(new UnauthorizedError('Неверная почта или пароль'));
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return next(new UnauthorizedError('Неверная почта или пароль'));
        }
        user.tokens.push({ token: createTokens(String(user._id)).refreshToken });
        return user.save().then((saved) => sendTokens(res, saved));
      });
    })
    .catch(next);
};

// GET /auth/token — новая пара токенов по refresh-куке
export const refreshAccessToken = (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return next(new UnauthorizedError('Нет refresh-токена'));
  }
  let payload: { _id: string };
  try {
    payload = verifyToken(refreshToken);
  } catch {
    return next(new UnauthorizedError('Токен просрочен или невалиден'));
  }
  return User.findById(payload._id)
    .select('+tokens')
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь не найден'));
      }
      // убираем старый токен, добавляем новый — без переприсваивания свойства
      const updatedTokens = user.tokens.filter((t) => t.token !== refreshToken);
      updatedTokens.push({ token: createTokens(String(user._id)).refreshToken });
      user.set('tokens', updatedTokens);
      return user.save().then((saved) => sendTokens(res, saved));
    })
    .catch(next);
};

// GET /auth/logout
export const logout = (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return next(new UnauthorizedError('Нет refresh-токена'));
  }
  let payload: { _id: string };
  try {
    payload = verifyToken(refreshToken);
  } catch {
    return next(new BadRequestError('Невалидный токен'));
  }
  return User.findByIdAndUpdate(
    payload._id,
    { $pull: { tokens: { token: refreshToken } } },
    { new: true },
  )
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь не найден'));
      }
      res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
      return res.send({ success: true });
    })
    .catch(next);
};

// GET /auth/user
export const getCurrentUser = (req: Request, res: Response, next: NextFunction) => {
  const typedReq = req as Request & { user?: { _id: string } };
  if (!typedReq.user) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }
  return User.findById(typedReq.user._id)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь не найден'));
      }
      return res.send({
        user: { email: user.email, name: user.name },
        success: true,
      });
    })
    .catch(next);
};
