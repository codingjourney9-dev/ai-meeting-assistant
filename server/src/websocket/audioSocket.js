

import { WebSocketServer } from 'ws';
import {
  createLiveTranscriptionSession,
} from '../services/transcriptionService.js';

import { TranscriptSegment } from '../models/TranscriptSegment.js';
import { Meeting } from '../models/Meeting.js';


export function attachAudioWebSocketServer(httpServer) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === '/audio') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
    
  });

  wss.on('connection', (socket, request) => {
    
    
    const url = new URL(request.url, 'http://localhost');
    const meetingId = url.searchParams.get('meetingId') || 'unknown';

    console.log(`[ws] Client connected to /audio (meetingId=${meetingId})`);

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    const dgSession = createLiveTranscriptionSession({
      meetingId,
      onTranscript: ({ text, isFinal }) => {
        const timestamp = Date.now();

        
        if (socket.readyState === socket.OPEN) {
          socket.send(
            JSON.stringify({ type: 'transcript', text, isFinal, timestamp })
          );
        }

        
        
        
        if (isFinal) {
          TranscriptSegment.create({ meetingId, text, isFinal, timestamp }).catch(
            (err) => console.error('[ws] Failed to persist segment:', err.message)
          );
        }
      },
      onError: (err) => {
        if (socket.readyState === socket.OPEN) {
          socket.send(JSON.stringify({ type: 'error', message: err.message }));
        }
      },
    });

    
    socket.send(JSON.stringify({ type: 'ready', meetingId }));

    socket.on('message', (data, isBinary) => {
      if (isBinary) {
        
        
        dgSession.sendAudioChunk(data);
      } else {
        
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'stop') {
            
            console.log(`[ws] Stop requested (meetingId=${meetingId})`);

            
            Meeting.findByIdAndUpdate(meetingId, { status: 'completed' }).catch(
              (err) => console.error('[ws] Failed to mark completed:', err.message)
            );

            dgSession.close();
            socket.close(1000, 'Recording stopped by client');
          }
        } catch {
          console.warn('[ws] Received malformed control message, ignoring.');
        }
      }
    });

    socket.on('close', () => {
      console.log(`[ws] Client disconnected (meetingId=${meetingId})`);
      
      dgSession.close();
    });

    socket.on('error', (err) => {
      console.error(`[ws] Socket error (meetingId=${meetingId}):`, err.message);
    });
  });

  console.log('[ws] Audio WebSocket server attached at path /audio');
  return wss;
}
