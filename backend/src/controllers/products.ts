import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import NotFoundError from '../errors/not-found-error';
import ConflictError from '../errors/conflict-error';

// Перенос файла из временной папки в постоянную
const moveFileFromTemp = (fileName: string) => {
  // fileName приходит в виде "/images/uuid.png" — берём только имя файла
  const baseName = fileName.replace('/images/', '');
  const tempPath = path.join(__dirname, '../tmp', baseName);
  const finalPath = path.join(__dirname, '../public/images', baseName);
  if (fs.existsSync(tempPath)) {
    fs.mkdirSync(path.dirname(finalPath), { recursive: true });
    fs.renameSync(tempPath, finalPath);
  }
};

// Общая обработка ошибок для создания и обновления товара
const handleProductError = (err: unknown, next: NextFunction) => {
  if (err instanceof mongoose.Error.ValidationError) {
    return next(new BadRequestError(`Ошибка валидации данных: ${err.message}`));
  }
  if (err instanceof Error && err.name === 'CastError') {
    return next(new BadRequestError('Невалидный _id товара'));
  }
  if (err instanceof Error && err.message.includes('E11000')) {
    return next(new ConflictError('Товар с таким названием уже существует'));
  }
  return next(err);
};

export const getProducts = (_req: Request, res: Response, next: NextFunction) => {
  Product.find({})
    .then((products) => res.send({ items: products, total: products.length }))
    .catch(next);
};

export const getProductById = (req: Request, res: Response, next: NextFunction) => {
  Product.findById(req.params.productId)
    .then((product) => {
      if (!product) {
        return next(new NotFoundError('Товар не найден'));
      }
      return res.send(product);
    })
    .catch((err) => {
      if (err instanceof Error && err.name === 'CastError') {
        return next(new BadRequestError('Невалидный _id товара'));
      }
      return next(err);
    });
};

export const createProduct = (req: Request, res: Response, next: NextFunction) => {
  const {
    title, image, category, description, price,
  } = req.body;

  Product.create({
    title, image, category, description, price,
  })
    .then((product) => {
      // переносим картинку из tmp в public/images, только если она была передана
      if (image?.fileName) moveFileFromTemp(image.fileName);
      return res.status(201).send(product);
    })
    .catch((err) => handleProductError(err, next));
};

export const updateProduct = (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;

  Product.findByIdAndUpdate(productId, req.body, {
    new: true, // вернуть обновлённый документ, а не старый
    runValidators: true, // проверять схему и при обновлении
  })
    .then((product) => {
      if (!product) {
        return next(new NotFoundError('Товар не найден'));
      }
      if (req.body.image?.fileName) moveFileFromTemp(req.body.image.fileName);
      return res.send(product);
    })
    .catch((err) => handleProductError(err, next));
};

export const deleteProduct = (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;

  Product.findByIdAndDelete(productId)
    .then((product) => {
      if (!product) {
        return next(new NotFoundError('Товар не найден'));
      }
      // триггер post('findOneAndDelete') в модели удалит файл картинки
      return res.send(product); // возвращаем удалённый товар — как в задании
    })
    .catch((err) => handleProductError(err, next));
};
