

import http from 'node:http'
import { app } from './app.js'
import { attachAudioWebSocketServer } from './websocket/audioSocket.js'
import { attachVideoSignalingServer } from './websocket/videoSignaling.js'
import { attachGlobalSocketServer } from './websocket/globalSocket.js'
import { env } from './config/env.js'
import { connectDatabase, disconnectDatabase } from './config/db.js'

async function main() {
  
  await connectDatabase()

  const httpServer = http.createServer(app)

  
  attachAudioWebSocketServer(httpServer)

  
  attachVideoSignalingServer(httpServer, env.CLIENT_ORIGIN)

  
  attachGlobalSocketServer(httpServer)

  httpServer.listen(env.PORT, () => {
    console.log('============================================================')
    console.log(`[server] REST API listening on  http://localhost:${env.PORT}/api`)
    console.log(`[server] Audio WebSocket on     ws://localhost:${env.PORT}/audio`)
    console.log(`[server] Video Signaling on     http://localhost:${env.PORT}/socket.io`)
    console.log(`[server] Global Socket on       http://localhost:${env.PORT}/global-socket`)
    console.log(`[server] Allowed CORS origin:   ${env.CLIENT_ORIGIN}`)
    console.log('============================================================')
  })

  
  const shutdown = async (signal) => {
    console.log(`\n[server] Received ${signal}. Shutting down...`)
    httpServer.close()
    await disconnectDatabase()
    process.exit(0)
  }
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main().catch((err) => {
  console.error('[server] Fatal startup error:', err)
  process.exit(1)
})
