import { Router } from 'express';
import { health, listCapabilities, unavailableInquiry } from '../controllers/publicController.js';

const router = Router();
router.get('/health', health);
router.get('/capabilities', listCapabilities);
router.post('/inquiries', unavailableInquiry);
export default router;
