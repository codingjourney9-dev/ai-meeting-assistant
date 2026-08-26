

import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { env } from '../config/env.js';


function hasRealKey() {
  return (
    !!env.DEEPGRAM_API_KEY &&
    env.DEEPGRAM_API_KEY !== 'your_deepgram_api_key_here'
  );
}



let deepgram = null;
function getDeepgramClient() {
  if (!deepgram) deepgram = createClient(env.DEEPGRAM_API_KEY);
  return deepgram;
}


export function createLiveTranscriptionSession({ meetingId, onTranscript, onError }) {
  
  
  
  
  if (!hasRealKey()) {
    console.warn(
      '[stt] DEEPGRAM_API_KEY not set — using STUB transcripts. ' +
        'Add your key to server/.env for real transcription.'
    );
    return createStubSession({ meetingId, onTranscript });
  }

  
  
  
  
  console.log(`[stt] Deepgram live session starting (meetingId=${meetingId})`);

  const dgConnection = getDeepgramClient().listen.live({
    model: 'nova-3',        
    language: 'en',         
    smart_format: true,     
    interim_results: true,  
    
    
  });

  
  
  let dgReady = false;
  const pendingChunks = [];

  dgConnection.on(LiveTranscriptionEvents.Open, () => {
    dgReady = true;
    console.log(`[stt] Deepgram connection open (meetingId=${meetingId}), flushing ${pendingChunks.length} buffered chunks`);
    while (pendingChunks.length > 0) dgConnection.send(pendingChunks.shift());
  });

  
  
  
  dgConnection.on(LiveTranscriptionEvents.Transcript, (event) => {
    const text = event.channel?.alternatives?.[0]?.transcript ?? '';
    if (text.trim()) {
      onTranscript({ text, isFinal: event.is_final === true });
    }
  });

  dgConnection.on(LiveTranscriptionEvents.Error, (err) => {
    console.error(`[stt] Deepgram error (meetingId=${meetingId}):`, err?.message || err);
    onError(new Error('Transcription service error: ' + (err?.message || 'unknown')));
  });

  dgConnection.on(LiveTranscriptionEvents.Close, () => {
    console.log(`[stt] Deepgram connection closed (meetingId=${meetingId})`);
  });

  return {
    
    sendAudioChunk(chunk) {
      if (dgReady) {
        dgConnection.send(chunk);
      } else {
        pendingChunks.push(chunk);
      }
    },

    
    close() {
      try {
        dgConnection.requestClose();
      } catch {
        
      }
    },
  };
}


function createStubSession({ meetingId, onTranscript }) {
  let chunkCount = 0;
  return {
    sendAudioChunk() {
      chunkCount += 1;
      if (chunkCount % 8 === 0) {
        onTranscript({
          text: `[stub transcript] received ${chunkCount} audio chunks for meeting ${meetingId}...`,
          isFinal: true,
        });
      }
    },
    close() {
      console.log(`[stt] STUB session closed (meetingId=${meetingId}, chunks=${chunkCount})`);
    },
  };
}
