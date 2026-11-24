import path from 'path';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import { requestLogger, errorLogger } from './middlewares/logger';
import productsRouter from './routes/products';
import orderRouter from './routes/order';
import { NotFoundError } from './errors/not-found-error';
import errorHandler from './middlewares/error-handler';
import { errors } from 'celebrate';
import { PORT, DB_ADDRESS } from './config';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// логгер запросов — юзаем перед всеми роутами
app.use(requestLogger);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/product', productsRouter);
app.use('/order', orderRouter);

// маршрут не найден — 404
app.use((req, res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});

// логгер ошибок — ПОСЛЕ роутов, ДО обработчика ошибок
app.use(errorLogger);

// обработчик ошибок celebrate (валидация)
app.use(errors());

// централизованный обработчик ошибок
app.use(errorHandler);

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
    // выводим ошибку ЦЕЛИКОМ, со стеком
    console.error('Ошибка подключения к MongoDB:', err);
    process.exit(1);
  });
