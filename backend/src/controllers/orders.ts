import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import { BadRequestError } from '../errors/bad-request-error';

const createOrder = (req: Request, res: Response, next: NextFunction) => {
  const { items, total } = req.body;
  return Product.find({ _id: { $in: items } })
    .then((products) => {
      // проверяем, что все товары существуют в базе
      if (products.length !== items.length) {
        return next(new BadRequestError('Один из товаров не найден'));
      }
      // проверяем, что все товары продаются (price не null)
      if (products.some((p) => p.price === null)) {
        return next(new BadRequestError('Один из товаров не продаётся'));
      }
      // проверяем сумму
      const sum = products.reduce((acc, p) => acc + (p.price ?? 0), 0);
      if (sum !== total) {
        return next(new BadRequestError('Общая сумма заказа не совпадает со стоимостью товаров'));
      }
      return res.send({ id: faker.string.uuid(), total: sum });
    })
    .catch(next);
};

export default createOrder;
