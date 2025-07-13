import { Hono } from 'hono';
import { getAllProfiles } from '../controllers/general';

const generalRoutes = new Hono();

generalRoutes.get('/get-all-profiles', getAllProfiles); 

export default generalRoutes;