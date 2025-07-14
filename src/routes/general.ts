import { Hono } from 'hono';
import { getAllProfiles, subscribeToNewsletter,submitContactUsForm, createProfile } from '../controllers/general';

const generalRoutes = new Hono();

generalRoutes.post('/create-profile', createProfile);
generalRoutes.get('/get-all-profiles', getAllProfiles); 
generalRoutes.post('/newsletter/subscribe', subscribeToNewsletter);
generalRoutes.post('/contactus',submitContactUsForm);


export default generalRoutes;