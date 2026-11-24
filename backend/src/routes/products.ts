import { Router } from 'express';
import { createProduct, getProducts } from '../controllers/products';
import { productValidation } from '../middlewares/validation';

const router = Router();

router.get('/', getProducts);
router.post('/', productValidation, createProduct);

export default router;
