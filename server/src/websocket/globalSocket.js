import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';

const connectedUsers = new Map(); 

export function attachGlobalSocketServer(httpServer) {
  
  const io = new Server(httpServer, {
    cors: { origin: '*' },
    path: '/global-socket'
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_123');
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[global-socket] User connected: ${socket.userId}`);
    connectedUsers.set(socket.userId, socket.id);

    
    socket.join(`user_${socket.userId}`);

    socket.on('send-message', async (data) => {
      try {
        const { conversationId, receiverId, text } = data;
        
        
        const message = await Message.create({
          conversationId,
          senderId: socket.userId,
          text
        });

        
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          updatedAt: new Date()
        });

        
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive-message', {
            _id: message._id,
            conversationId,
            senderId: socket.userId,
            text,
            createdAt: message.createdAt
          });
        }
        
        
        socket.emit('message-sent', {
          _id: message._id,
          conversationId,
          senderId: socket.userId,
          text,
          createdAt: message.createdAt
        });

      } catch (error) {
        console.error('[global-socket] Send message error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[global-socket] User disconnected: ${socket.userId}`);
      connectedUsers.delete(socket.userId);
    });
  });

  return io;
}
