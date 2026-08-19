import { Request, Response } from 'express';
import User from '../models/User.js';


interface AuthRequest extends Request {
  user?: {
    clerkId: string;
  };
  
}
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const clerkId = req.user?.clerkId;
    if (!clerkId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findOne({ clerkId }).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Server error during auth verification" });
  }
};

