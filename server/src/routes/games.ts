import express from 'express';
import { createGame } from '../controllers/gameController.js';
import { roomExist } from '../controllers/gameController.js';
import { authMwr } from '../middleware/authMwr.js';

const router = express.Router();

// Apply auth middleware to all game routes
router.post('/create', authMwr, createGame);
router.post('/:code', roomExist);

export default router;
