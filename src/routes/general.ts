import { Hono } from 'hono';
import { getAllProfiles, subscribeToNewsletter,submitContactUsForm, createProfile, getProfileByUUID } from '../controllers/general';

const generalRoutes = new Hono();

generalRoutes.post('/create-profile', createProfile);
generalRoutes.get('/get-all-profiles', getAllProfiles);
generalRoutes.get('/get-profile/:uuid', getProfileByUUID); 
generalRoutes.post('/newsletter/subscribe', subscribeToNewsletter);
generalRoutes.post('/contactus',submitContactUsForm);


export default generalRoutes;