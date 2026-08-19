import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@clerk/backend";

export interface AuthRequest extends Request {
  user?: {
    clerkId: string;   // Clerk user ID
  };
}

export const authMwr = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ message: "No token, authorization denied" });
    return;
  }

  try {
    // Clerk verifies the JWT and returns the payload
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,   
    });

    // Clerk’s user ID is in `sub`
    req.user = { clerkId: payload.sub };

    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};
