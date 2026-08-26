

import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import meetingRoutes from './routes/meetingRoutes.js';
import summaryRoutes from './routes/summaryRoutes.js';
import authRoutes from './routes/authRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export const app = express();








app.use(cors({ origin: env.CLIENT_ORIGIN }));


app.use(express.json({ limit: '2mb' }));


app.use((req, _res, next) => {
  console.log(`[http] ${req.method} ${req.originalUrl}`);
  next();
});





app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'smart-meeting-assistant-server', time: new Date().toISOString() });
});






app.use('/api/meetings', meetingRoutes);


app.use('/api/auth', authRoutes);


app.use('/api/friends', friendRoutes);
app.use('/api/chat', chatRoutes);



app.use('/api/meetings', summaryRoutes);





app.use('/api', notFoundHandler);
app.use('/api', errorHandler);




import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.static(path.join(__dirname, '..', 'public')));


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});


app.use(errorHandler);
