import { Request, Response } from 'express';
import Player from '../models/Player.js';
import { normalize, escapeRegex } from '../utils/search.js';


const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 50;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 10;

// Get all players with optional filtering
export const getAllPlayers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Build query with optional filters
    const query: any = {};

    const raw = req.query.q;

    // Rejects arrays and objects like ?q[$ne]=x
    if (typeof raw !== 'string') {
      res.status(400).json({ success: false, message: 'q must be a string' });
      return;
    }
  
    // Optional filters from query params
    if (req.query.country) query.country = req.query.country;
    if (req.query.position) query.position = req.query.position;
    if (req.query.club) query.club = req.query.club;

    
    // Pagination
    const requested = parseInt(String(req.query.limit), 10);
    const limit = Math.min(Math.max(Number.isNaN(requested) ? DEFAULT_LIMIT : requested, 1), MAX_LIMIT);
    const page = parseInt(req.query.page as string) || 1;
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
      .limit(Math.min(limit, 10))
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


// SearchPlayers
export const searchPlayers = async (req: Request, res: Response): Promise<void> => {
  try {
    const raw = req.query.q;

    // Rejects arrays and objects like ?q[$ne]=x
    if (typeof raw !== 'string') {
      res.status(400).json({ success: false, message: 'q must be a string' });
      return;
    }

    const q = normalize(raw);
    if (q.length < MIN_QUERY_LENGTH || q.length > MAX_QUERY_LENGTH) {
      res.json({ success: true, data: [] });
      return;
    }

    const requested = parseInt(String(req.query.limit), 10);
    const limit = Math.min(Math.max(Number.isNaN(requested) ? DEFAULT_LIMIT : requested, 1), MAX_LIMIT);

    const players = await Player.find({ searchName: { $regex: '^' + escapeRegex(q) } })
      .sort({ searchName: 1 }) 
      .limit(limit)
      .select('_id name club')
      .lean();

    res.json({ success: true, data: players });
  } catch (error) {
    console.error('Search players error:', error);
    res.status(500).json({ success: false, message: 'Error searching players' });
  }
};


