import { Request, Response } from 'express';
import { getAuth, clerkClient } from '@clerk/express';

export const getTestToken = async (req: Request, res: Response) => {
  try {
    const { userId, sessionId } = getAuth(req);
    if (!userId || !sessionId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Generate a token from a JWT template  'postman'
    const token = await clerkClient.sessions.getToken(sessionId, 'postman');
    res.json({ token: token.jwt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Token generation failed' });
  }
};