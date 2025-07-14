import { Hono } from 'hono';
import { createProduct, getAllProducts, updateProduct, deleteProduct } from '../controllers/product';

const productRoutes = new Hono();

productRoutes.post('/create-new', createProduct); 
productRoutes.get('/get-all', getAllProducts);
productRoutes.delete('/delete/:product_id', updateProduct);
productRoutes.patch('/update/:product_id', updateProduct);


export default productRoutes;