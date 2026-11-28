import jwt from 'jsonwebtoken';
import ms from 'ms';
import { JWT_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from '../config';

export interface TokenPayload {
  _id: string;
}

export const createTokens = (userId: string) => {
  const payload: TokenPayload = { _id: userId };
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY as ms.StringValue,
  });
  const refreshToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY as ms.StringValue,
  });
  return { accessToken, refreshToken };
};

export const verifyToken = (token: string) => jwt.verify(token, JWT_SECRET) as { _id: string };
