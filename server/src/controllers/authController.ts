import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Respond with user data (excluding password)
    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      stats: newUser.stats,
      createdAt: newUser.createdAt,
    };

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'default_secret', // Fallback for dev, but should be in .env
      { expiresIn: '1d' }
    );

    // Respond with token and user info
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      stats: user.stats,
      createdAt: user.createdAt,
    };

    res.status(200).json({ token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // Cast req to any to access user added by middleware, or better yet import AuthRequest if possible.
    // Given existing imports, I'll use a type assertion for now or modify imports if I can see them.
    // The previous view showed imports: import { Request, Response } from 'express';
    // I'll cast req.user
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Server error during auth verification' });
  }
};
