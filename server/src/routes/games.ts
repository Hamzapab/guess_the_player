import express from 'express';
import { createGame } from '../controllers/gameController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all game routes
router.post('/create', auth, createGame);

export default router;
