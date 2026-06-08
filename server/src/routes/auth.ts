import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createUserSchema , loginUserSchema } from '../validator/userValidator.js';

const router = Router();

router.post('/signup', validate(createUserSchema), register);
router.post('/login', validate(loginUserSchema), login);
router.get('/me', auth, getMe);

export default router;
