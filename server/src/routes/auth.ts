import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { authMwr } from '../middleware/authMwr.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createUserSchema , loginUserSchema } from '../validator/userValidator.js';

const router = Router();

router.post('/signup', validate(createUserSchema), register);
router.post('/login', validate(loginUserSchema), login);
router.get('/me', authMwr, getMe);

export default router;
