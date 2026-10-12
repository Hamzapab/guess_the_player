import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { getTestToken } from '../controllers/testController.js';

const router = Router();

router.get('/', requireAuth(), getTestToken);

export default router;