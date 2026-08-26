

import mongoose from 'mongoose';
import { env } from './env.js';


export async function connectDatabase() {
  if (!env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not set. Copy server/.env.example to server/.env and ' +
        'fill in your MongoDB connection string (local or Atlas).'
    );
  }

  
  mongoose.connection.on('connected', () =>
    console.log('[db] Mongoose connected to MongoDB'));
  mongoose.connection.on('error', (err) =>
    console.error('[db] Mongoose connection error:', err.message));
  mongoose.connection.on('disconnected', () =>
    console.warn('[db] Mongoose disconnected'));

  
  
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  
}


export async function disconnectDatabase() {
  await mongoose.disconnect();
  console.log('[db] Mongoose disconnected (graceful shutdown)');
}
