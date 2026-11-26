import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/products';
import auth from '../middlewares/auth';

const productsRouter = Router();

// GET — открыт для всех (витрина работает без авторизации)
productsRouter.get('/', getProducts);
productsRouter.get('/:productId', getProductById);

// POST /product — только для авторизованных
productsRouter.post(
  '/',
  auth,
  celebrate({
    body: Joi.object().keys({
      title: Joi.string().required().min(2).max(100),
      image: Joi.object()
        .keys({
          fileName: Joi.string().required(),
          originalName: Joi.string().required(),
        })
        .required(),
      category: Joi.string()
        .required()
        .valid('софт-скил', 'хард-скил', 'другое', 'дополнительное', 'кнопка'),
      description: Joi.string(),
      price: Joi.number().allow(null).min(0),
    }),
  }),
  createProduct,
);

// PATCH /product/:productId — только для авторизованных, все поля необязательные
productsRouter.patch(
  '/:productId',
  auth,
  celebrate({
    body: Joi.object().keys({
      title: Joi.string().min(2).max(100),
      image: Joi.object().keys({
        fileName: Joi.string().required(),
        originalName: Joi.string().required(),
      }),
      category: Joi.string().valid('софт-скил', 'хард-скил', 'другое', 'дополнительное', 'кнопка'),
      description: Joi.string(),
      price: Joi.number().allow(null).min(0),
    }),
  }),
  updateProduct,
);

// DELETE /product/:productId — только для авторизованных
productsRouter.delete('/:productId', auth, deleteProduct);

export default productsRouter;
