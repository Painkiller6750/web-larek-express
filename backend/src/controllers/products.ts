import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Product from '../models/product';
import { BadRequestError } from '../errors/bad-request-error';
import { ConflictError } from '../errors/conflict-error';

export const getProducts = (req: Request, res: Response, next: NextFunction) => {
  Product.find({})
    .then((products) => res.send({ items: products, total: products.length }))
    .catch(next);
};

export const createProduct = (req: Request, res: Response, next: NextFunction) => {
  const { title, image, category, description, price } = req.body;

  Product.create({ title, image, category, description, price })
    .then((product) => res.status(201).send(product))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError(`Ошибка валидации данных при создании товара: ${err.message}`));
      }
      if (err instanceof Error && err.message.includes('E11000')) {
        return next(new ConflictError('Товар с таким названием уже существует'));
      }
      next(err);
    });
};
