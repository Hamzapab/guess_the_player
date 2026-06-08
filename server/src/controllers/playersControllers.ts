// src/controllers/playerController.ts
import { Request, Response } from 'express';
import Player from '../models/Player.js';

// Get all players with optional filtering
export const getAllPlayers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Build query with optional filters
    const query: any = {};
    
    // Optional filters from query params
    if (req.query.country) query.country = req.query.country;
    if (req.query.position) query.position = req.query.position;
    if (req.query.club) query.club = req.query.club;
    
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    // Sorting
    const sortBy = req.query.sortBy as string || 'name';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const sort: any = {};
    sort[sortBy] = sortOrder;
    
    // Execute query
    const players = await Player.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v'); // Exclude version field
      
    // Get total count for pagination
    const total = await Player.countDocuments(query);
    
    res.json({
      success: true,
      data: players,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all players error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching players' 
    });
  }
};



