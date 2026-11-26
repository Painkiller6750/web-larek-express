import { Request, Response } from 'express';

// multer кладёт загруженный файл в req.file
export const uploadFile = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).send({ message: 'Файл не передан' });
  }
  return res.send({
    fileName: `/images/${req.file.filename}`,      // "/images/686ade58.png"
    originalName: req.file.originalname,           // "Dot.png"
  });
};
