import { model, Schema } from 'mongoose';
import { IUser } from '../types';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      minlength: [2, 'Минимальная длина имени — 2 символа'],
      maxlength: [30, 'Максимальная длина имени — 30 символов'],
      default: 'Ё-мое',
    },
    email: {
      type: String,
      required: [true, 'Поле email обязательно'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Поле password обязательно'],
      minlength: [6, 'Минимальная длина пароля — 6 символов'],
      select: false, // хеш пароля не возвращается из базы по умолчанию
    },
    tokens: [
      {
        token: { type: String, required: true },
      },
    ],
  },
  { versionKey: false },
);
export default model<IUser>('user', userSchema);
