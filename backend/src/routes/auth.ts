import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import {
  login, register, logout, refreshAccessToken, getCurrentUser,
} from '../controllers/auth';
import auth from '../middlewares/auth';

const authRouter = Router();

authRouter.post(
  '/register',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      email: Joi.string().required().email(),
      password: Joi.string().required().min(6),
    }),
  }),
  register,
);

authRouter.post(
  '/login',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(6),
    }),
  }),
  login,
);

authRouter.get('/token', refreshAccessToken);
authRouter.get('/logout', logout);
authRouter.get('/user', auth, getCurrentUser);

export default authRouter;
