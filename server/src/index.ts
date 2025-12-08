import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import connectDB from './config/db.js';
import { initializeSocket } from './socket.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth.js';
import gameRoutes from './routes/games.js';

app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);

connectDB();

const httpServer = http.createServer(app);
initializeSocket(httpServer);

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
