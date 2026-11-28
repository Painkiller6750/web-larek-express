import path from 'path';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';
import fs from 'fs';
import { errors } from 'celebrate';
import { requestLogger, errorLogger } from './middlewares/logger';
import productsRouter from './routes/products';
import orderRouter from './routes/order';
import authRouter from './routes/auth';
import uploadRouter from './routes/upload';
import NotFoundError from './errors/not-found-error';
import errorHandler from './middlewares/error-handler';
import { PORT, DB_ADDRESS } from './config';

const app = express();

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));
app.use(cookieParser()); // обязателен ДО роутов — иначе req.cookies будет пустым
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// логгер запросов — ДО всех роутов
app.use(requestLogger);

// статика: раздаём картинки из public/images от корня
app.use(express.static(path.join(__dirname, 'public')));

app.use('/product', productsRouter);
app.use('/order', orderRouter);
app.use('/auth', authRouter);
app.use('/upload', uploadRouter);

// маршрут не найден — 404
app.use((_req, _res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});

// логгер ошибок — ПОСЛЕ роутов, ДО обработчика ошибок
app.use(errorLogger);

// обработчик ошибок celebrate (валидация)
app.use(errors());

// централизованный обработчик ошибок
app.use(errorHandler);

// --- очистка временной папки от старых файлов (каждый час) ---
const TEMP_DIR = path.join(__dirname, 'tmp');
cron.schedule('0 * * * *', () => {
  fs.readdir(TEMP_DIR, (err, files) => {
    if (err) return;
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // старше суток
    files.forEach((f) => {
      const filePath = path.join(TEMP_DIR, f);
      fs.stat(filePath, (statErr, stat) => {
        if (!statErr && stat.mtimeMs < cutoff) {
          fs.unlink(filePath, () => {});
        }
      });
    });
  });
});

// --- подключение к MongoDB с диагностикой ---
console.log('Пытаемся подключиться к:', DB_ADDRESS);

mongoose
  .connect(DB_ADDRESS)
  .then(() => {
    console.log('Подключено к MongoDB');
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Ошибка подключения к MongoDB:', err);
    process.exit(1);
  });
