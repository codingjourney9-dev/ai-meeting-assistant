

import { useRef, useState, useCallback, useEffect } from 'react';



const TIMESLICE_MS = 250;

export function useAudioRecorder() {
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);

  
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  
  useEffect(() => {
    let mounted = true;
    async function updateDevices() {
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        if (!mounted) return;
        const inputs = list.filter((d) => d.kind === 'audioinput');
        setDevices(inputs);
        if (!selectedDeviceId && inputs.length) {
          setSelectedDeviceId(inputs[0].deviceId || '');
        }
      } catch (err) {
        
      }
    }
    updateDevices();
    
    const handler = () => updateDevices();
    navigator.mediaDevices && navigator.mediaDevices.addEventListener &&
      navigator.mediaDevices.addEventListener('devicechange', handler);
    return () => {
      mounted = false;
      navigator.mediaDevices && navigator.mediaDevices.removeEventListener &&
        navigator.mediaDevices.removeEventListener('devicechange', handler);
    };
  }, [selectedDeviceId]);

  
  const startRecording = useCallback(async (onChunk, deviceId, existingStream) => {
    setError(null);
    try {
      let stream = existingStream;
      if (!stream) {
        
        
        const constraint = deviceId || selectedDeviceId
          ? { deviceId: { exact: deviceId || selectedDeviceId } }
          : true;
        stream = await navigator.mediaDevices.getUserMedia({ audio: constraint });
      }
      streamRef.current = stream;

      
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        const inputs = list.filter((d) => d.kind === 'audioinput');
        setDevices(inputs);
        if (!selectedDeviceId && inputs.length) setSelectedDeviceId(inputs[0].deviceId || '');
      } catch {}

      
      const audioTracks = stream.getAudioTracks();
      const audioStream = new MediaStream(audioTracks);

      
      const recorder = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      mediaRecorderRef.current = recorder;

      
      
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) onChunk(event.data);
      };

      recorder.start(TIMESLICE_MS);
      setIsRecording(true);
    } catch (err) {
      
      setError(err.message || 'Microphone access failed');
      setIsRecording(false);
    }
  }, []);

  
  const stopRecording = useCallback((keepStreamAlive = false) => {
    mediaRecorderRef.current?.state !== 'inactive' &&
      mediaRecorderRef.current?.stop();
    
    if (!keepStreamAlive) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    }
    
    mediaRecorderRef.current = null;
    streamRef.current = null;
    setIsRecording(false);
  }, []);

  return {
    isRecording,
    error,
    startRecording,
    stopRecording,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
  };
}
