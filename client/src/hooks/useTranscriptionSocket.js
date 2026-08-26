

import { useRef, useState, useCallback } from 'react';


const WS_URL = import.meta.env.VITE_WS_URL || (typeof window !== 'undefined' ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/audio` : 'ws://localhost:5000/audio');

export function useTranscriptionSocket() {
  const socketRef = useRef(null);

  
  const [status, setStatus] = useState('idle');

  
  const [segments, setSegments] = useState([]);

  
  
  const [interimText, setInterimText] = useState('');

  
  const connect = useCallback((meetingId) => {
    return new Promise((resolve, reject) => {
      setStatus('connecting');

      
      
      const socket = new WebSocket(`${WS_URL}?meetingId=${meetingId}`);
      socketRef.current = socket;

      socket.onopen = () => setStatus('open');

      socket.onmessage = (event) => {
        
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case 'ready':
            
            resolve();
            break;

          case 'transcript':
            if (msg.isFinal) {
              
              setSegments((prev) => [
                ...prev,
                { text: msg.text, timestamp: msg.timestamp },
              ]);
              setInterimText('');
            } else {
              
              setInterimText(msg.text);
            }
            break;

          case 'error':
            console.error('[ws] Server error:', msg.message);
            break;

          default:
            console.warn('[ws] Unknown message type:', msg.type);
        }
      };

      socket.onerror = () => {
        setStatus('error');
        reject(new Error('WebSocket connection failed — is the server on :5000?'));
      };

      socket.onclose = () => setStatus('closed');
    });
  }, []);

  
  const sendAudioChunk = useCallback((chunk) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(chunk); 
    }
  }, []);

  
  const disconnect = useCallback(() => {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'stop' })); 
      socket.close(1000, 'Client finished recording');
    }
    socketRef.current = null;
  }, []);

  
  const resetTranscript = useCallback(() => {
    setSegments([]);
    setInterimText('');
  }, []);

  return {
    status,
    segments,
    interimText,
    connect,
    sendAudioChunk,
    disconnect,
    resetTranscript,
  };
}
