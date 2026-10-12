import { Router } from 'express';
import { getLeaderboard } from '../controllers/leaderboardController.js';
import { authMwr } from '../middleware/authMwr.js';

const router = Router();

// router.get('/', authMwr , getLeaderboard);

// For Ded only
router.get('/' , getLeaderboard);

export default router;