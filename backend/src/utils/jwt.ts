import jwt from 'jsonwebtoken';
import ms from 'ms';

export const createTokens = (userId: string) => {
  const payload = { _id: userId };
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET не задан — проверьте файл .env');
  }
  const accessToken = jwt.sign(payload, secret, {
    expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY as ms.StringValue, // 10 минут
  });
  const refreshToken = jwt.sign(payload, secret, {
    expiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRY as ms.StringValue, // неделя
  });
  return { accessToken, refreshToken };
};

export const verifyToken = (token: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET не задан — проверьте файл .env');
  }
  return jwt.verify(token, secret) as { _id: string };
};
