import { celebrate, Joi } from 'celebrate';

const productValidation = celebrate({
  body: Joi.object().keys({
    title: Joi.string().min(2).max(30).required(),
    image: Joi.object()
      .keys({
        fileName: Joi.string().required(),
        originalName: Joi.string().required(),
      })
      .required(),
    category: Joi.string().required(),
    description: Joi.string(),
    price: Joi.number().allow(null),
  }),
});

const orderValidation = celebrate({
  body: Joi.object().keys({
    payment: Joi.string().valid('card', 'online').required(),
    email: Joi.string().required().email(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    total: Joi.number().required(),
    items: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  }),
});

export { productValidation, orderValidation };
