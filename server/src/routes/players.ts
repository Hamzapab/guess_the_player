import express from 'express';
import { getAllPlayers } from '../controllers/playersControllers.js';
import { authMwr } from '../middleware/authMwr.js';
import { searchPlayers } from '../controllers/playersControllers.js';

const router = express.Router();

router.get('/search', searchPlayers);
router.get('/', getAllPlayers);

export default router;
