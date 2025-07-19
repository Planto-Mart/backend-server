import { Hono } from 'hono';
import { createProduct, getAllProducts, updateProduct, deleteProduct, getProductById, getProductsByVendor } from '../controllers/product';

const productRoutes = new Hono();

productRoutes.post('/create-new', createProduct); 
productRoutes.get('/get-all', getAllProducts);
productRoutes.get('get-product-of/:vendorID',getProductsByVendor);
productRoutes.get('/get/:product_id', getProductById); 
productRoutes.delete('/delete/:product_id', deleteProduct);
productRoutes.patch('/update/:product_id', updateProduct);


export default productRoutes;