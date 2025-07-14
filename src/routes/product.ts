import { Hono } from 'hono';
import { createProduct, getAllProducts } from '../controllers/product';

const productRoutes = new Hono();

productRoutes.post('/create-new', createProduct); 
productRoutes.get('/get-all', getAllProducts);


export default productRoutes;