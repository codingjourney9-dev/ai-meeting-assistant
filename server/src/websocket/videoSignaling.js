



import { Server } from 'socket.io'


const rooms = new Map()
const users = new Map() 

export function attachVideoSignalingServer(httpServer, clientOrigin) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',          
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
    transports: ['websocket', 'polling']
  })

  io.on('connection', (socket) => {
    console.log(`[video] User connected: ${socket.id}`)

    
    socket.on('join-room', ({ roomId, userId, username }) => {
      console.log(`[video] ${username} joining room: ${roomId}`)

      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          participants: new Map(),
          createdAt: new Date()
        })
      }

      const room = rooms.get(roomId)

      
      if (room.participants.size >= 10) {
        socket.emit('room-full', { roomId })
        console.log(`[video] Room ${roomId} is full, rejecting ${username}`)
        return
      }

      socket.join(roomId)

      const userInfo = {
        socketId: socket.id,
        userId,
        username,
        roomId,
        joinedAt: new Date()
      }
      users.set(socket.id, userInfo)
      room.participants.set(socket.id, userInfo)

      
      socket.to(roomId).emit('user-joined', {
        userId,
        username,
        socketId: socket.id
      })

      
      const participants = Array.from(room.participants.values())
        .filter(p => p.socketId !== socket.id)
        .map(p => ({
          userId: p.userId,
          username: p.username,
          socketId: p.socketId
        }))

      socket.emit('room-users', {
        roomId,
        participants,
        roomCreatedAt: room.createdAt
      })

      console.log(`[video] ${username} joined ${roomId}. Total: ${room.participants.size}`)
    })

    
    socket.on('offer', ({ to, offer }) => {
      const fromUser = users.get(socket.id)
      if (fromUser) {
        console.log(`[video] Offer from ${fromUser.username} to ${to}`)
        io.to(to).emit('offer', {
          from: socket.id,
          fromUsername: fromUser.username,
          offer
        })
      }
    })

    
    socket.on('answer', ({ to, answer }) => {
      const fromUser = users.get(socket.id)
      if (fromUser) {
        console.log(`[video] Answer from ${fromUser.username} to ${to}`)
        io.to(to).emit('answer', {
          from: socket.id,
          fromUsername: fromUser.username,
          answer
        })
      }
    })

    
    socket.on('ice-candidate', ({ to, candidate }) => {
      const fromUser = users.get(socket.id)
      if (fromUser) {
        io.to(to).emit('ice-candidate', {
          from: socket.id,
          candidate
        })
      }
    })

    
    socket.on('screen-share-started', ({ roomId }) => {
      const user = users.get(socket.id)
      if (user) {
        console.log(`[video] ${user.username} started screen sharing`)
        socket.to(roomId).emit('screen-share-started', {
          userId: user.userId,
          username: user.username,
          socketId: socket.id
        })
      }
    })

    socket.on('screen-share-stopped', ({ roomId }) => {
      const user = users.get(socket.id)
      if (user) {
        console.log(`[video] ${user.username} stopped screen sharing`)
        socket.to(roomId).emit('screen-share-stopped', {
          userId: user.userId,
          username: user.username,
          socketId: socket.id
        })
      }
    })

    
    socket.on('chat-message', ({ roomId, text }) => {
      const user = users.get(socket.id)
      if (user) {
        
        socket.to(roomId).emit('chat-message', {
          userId: user.userId,
          username: user.username,
          text,
          timestamp: new Date()
        })
      }
    })

    
    socket.on('media-state-changed', ({ roomId, audioEnabled, videoEnabled }) => {
      const user = users.get(socket.id)
      if (user) {
        socket.to(roomId).emit('user-media-state', {
          socketId: socket.id,
          userId: user.userId,
          username: user.username,
          audioEnabled,
          videoEnabled
        })
      }
    })

    
    socket.on('leave-room', ({ roomId }) => {
      handleUserLeave(socket, roomId)
    })

    
    socket.on('disconnect', () => {
      const user = users.get(socket.id)
      if (user) {
        handleUserLeave(socket, user.roomId)
      }
      console.log(`[video] User disconnected: ${socket.id}`)
    })

    
    socket.on('get-room-info', ({ roomId }) => {
      const room = rooms.get(roomId)
      if (room) {
        const participants = Array.from(room.participants.values()).map(p => ({
          userId: p.userId,
          username: p.username
        }))
        socket.emit('room-info', {
          roomId,
          participantCount: room.participants.size,
          participants,
          createdAt: room.createdAt
        })
      } else {
        socket.emit('room-info', {
          roomId,
          participantCount: 0,
          participants: [],
          exists: false
        })
      }
    })
  })

  function handleUserLeave(socket, roomId) {
    const user = users.get(socket.id)
    if (!user) return

    const room = rooms.get(roomId)
    if (room) {
      room.participants.delete(socket.id)

      socket.to(roomId).emit('user-left', {
        userId: user.userId,
        username: user.username,
        socketId: socket.id
      })

      
      if (room.participants.size === 0) {
        rooms.delete(roomId)
        console.log(`[video] Room ${roomId} deleted (empty)`)
      } else {
        console.log(`[video] ${user.username} left ${roomId}. Remaining: ${room.participants.size}`)
      }
    }

    users.delete(socket.id)
    socket.leave(roomId)
  }

  console.log('[video] Video signaling server ready at /socket.io')
  return io
}


export function getRoomStats() {
  const stats = {
    totalRooms: rooms.size,
    totalUsers: users.size,
    rooms: []
  }

  rooms.forEach((room, roomId) => {
    stats.rooms.push({
      id: roomId,
      participants: room.participants.size,
      createdAt: room.createdAt
    })
  })

  return stats
}
