import { model, Schema } from 'mongoose';
import fs from 'fs';
import path from 'path';
import { IProduct } from '../types';

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, 'Заполните название товара'],
      unique: true, // по заданию 409 при существующем title
    },
    image: {
      fileName: { type: String, required: true }, // "/images/686ade58.png"
      originalName: { type: String, required: true }, // "5_Dots.png"
    },
    category: {
      type: String,
      enum: ['софт-скил', 'хард-скил', 'другое', 'дополнительное', 'кнопка'],
      required: true,
    },
    description: { type: String, default: '' },
    price: {
      type: Number,
      default: null,
      // товар может быть «не продаётся» (цена null), поэтому не required
    },
  },
  { versionKey: false },
);

// Триггер: после удаления документа удаляем его картинку с диска
productSchema.post('findOneAndDelete', async (doc) => {
  if (doc?.image?.fileName) {
    const baseName = doc.image.fileName.replace('/images/', '');
    const filePath = path.join(__dirname, '../public/images', baseName);
    // файл мог уже отсутствовать — глушим ошибку удаления
    fs.promises.unlink(filePath).catch(() => {});
  }
});

export default model<IProduct>('product', productSchema);
