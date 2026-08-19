import { Router } from 'express';
import {  getMe } from '../controllers/authController.js';
import { authMwr } from '../middleware/authMwr.js';


const router = Router();

router.get('/me', authMwr, getMe);

export default router;
