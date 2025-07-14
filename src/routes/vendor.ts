import { Hono } from 'hono';
import {
  vendorRegister,
  updateVendor,
  deleteVendor,
} from '../controllers/vendor';

const vendorRoutes = new Hono();

vendorRoutes.post('/register', vendorRegister);
vendorRoutes.patch('/update/:vendor_id', updateVendor);
vendorRoutes.delete('/delete/:vendor_id', deleteVendor);

export default vendorRoutes;
