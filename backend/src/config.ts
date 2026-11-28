import dotenv from 'dotenv';

dotenv.config();

export const PORT = Number(process.env.PORT) || 3000;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/weblarek';
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
export const ACCESS_TOKEN_EXPIRY = process.env.AUTH_ACCESS_TOKEN_EXPIRY || '10m';
export const REFRESH_TOKEN_EXPIRY = process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d';

// алиас, чтобы не менять импорты в app.ts
export const DB_ADDRESS = MONGODB_URI;
