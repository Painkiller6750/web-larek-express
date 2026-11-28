import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import createOrder from '../controllers/orders';

const router = Router();

router.post('/', celebrate({
  body: Joi.object().keys({
    payment: Joi.string().valid('card', 'online').required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[\d\s()-]{10,}$/).required(),
    address: Joi.string().min(5).required(),
    total: Joi.number().required(),
    items: Joi.array().items(Joi.string()).required(),
  }),
}), createOrder);

export default router;
