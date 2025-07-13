import { Hono } from 'hono';
import { getAllProfiles, subscribeToNewsletter,submitContactUsForm } from '../controllers/general';

const generalRoutes = new Hono();

generalRoutes.get('/get-all-profiles', getAllProfiles); 
generalRoutes.post('/newsletter/subscribe', subscribeToNewsletter);
generalRoutes.post('/contactus',submitContactUsForm);


export default generalRoutes;