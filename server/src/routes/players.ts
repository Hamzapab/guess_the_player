import express from 'express';
import { getAllPlayers } from '../controllers/playersControllers.js';
import { authMwr } from '../middleware/authMwr.js';

const router = express.Router();

router.get('/', getAllPlayers);

export default router;
