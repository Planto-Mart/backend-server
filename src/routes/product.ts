import { Hono } from 'hono';
import { 
  createProduct, 
  getAllProducts, 
  updateProduct, 
  deleteProduct, 
  getProductById, 
  getProductsByVendor,
  createProductVariant,
  getProductBySlug,
  updateProductVariant,
  deleteProductVariant,
  getFeaturedProducts,
  getFeaturedProductsByCategory,
  getProductsByStartingPrice,
  getProductsByMinDiscount,
  getTopRatedProductsByVendor
} from '../controllers/product';

const productRoutes = new Hono();

productRoutes.post('/create-new', createProduct); 
productRoutes.get('/get-all', getAllProducts);
productRoutes.get('get-products-of/:vendorID',getProductsByVendor);
productRoutes.get('/get/:product_id', getProductById); 
productRoutes.get('/get-by-slug/:slug', getProductBySlug); // NEW: Get product by slug
productRoutes.delete('/delete/:product_id', deleteProduct);
productRoutes.patch('/update/:product_id', updateProduct);

// NEW: Variant management routes
productRoutes.post('/variants/create', createProductVariant);
productRoutes.patch('/variants/update/:variant_id', updateProductVariant);
productRoutes.delete('/variants/delete/:variant_id', deleteProductVariant);

// Featured get requests
productRoutes.get('/featured', getFeaturedProducts);
productRoutes.get('/featured-on-category/:category', getFeaturedProductsByCategory);
productRoutes.get('/starting-price', getProductsByStartingPrice);
productRoutes.get('/discounted/:discount?', getProductsByMinDiscount);
productRoutes.get('/top-rated/:vendorID?', getTopRatedProductsByVendor);

export default productRoutes;