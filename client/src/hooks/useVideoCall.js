


import { useState, useCallback, useRef, useEffect } from 'react'
import { io } from 'socket.io-client'



const SOCKET_URL = ''


const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
]

export function useVideoCall() {
  const [socket, setSocket] = useState(null)
  const [roomId, setRoomId] = useState(null)
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [username, setUsername] = useState('')
  const [localStream, setLocalStream] = useState(null)
  const [peers, setPeers] = useState(new Map())
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [hasAudio, setHasAudio] = useState(false)
  const [hasVideo, setHasVideo] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [connectionState, setConnectionState] = useState('disconnected')
  const [error, setError] = useState(null)
  
  
  const [chatMessages, setChatMessages] = useState([])

  
  const [availableMics, setAvailableMics] = useState([])
  const [availableCameras, setAvailableCameras] = useState([])
  const [selectedMicId, setSelectedMicId] = useState('')
  const [selectedCameraId, setSelectedCameraId] = useState('')

  
  const peerConnections = useRef(new Map())
  const localStreamRef = useRef(null)
  const screenStreamRef = useRef(null)
  const socketRef = useRef(null)
  const roomIdRef = useRef(null)

  useEffect(() => { socketRef.current = socket }, [socket])
  useEffect(() => { roomIdRef.current = roomId }, [roomId])

  
  
  const getLocalStream = useCallback(async () => {
    try {
      console.log('[video] Requesting media access...')
      
      let mediaStream = null
      let gotVideo = false
      let gotAudio = false
      
      
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true, audio: true
        })
        gotVideo = true
        gotAudio = true
        console.log('[video] Got camera AND microphone')
      } catch (err) {
        console.log('[video] No camera, trying audio only...')
        
        
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: false, audio: true
          })
          gotVideo = false
          gotAudio = true
          console.log('[video] Got mic only (no camera)')
        } catch (audioErr) {
          console.error('[video] No mic found either')
          throw new Error('No microphone found. Please connect a headset or mic.')
        }
      }
      
      localStreamRef.current = mediaStream
      setLocalStream(mediaStream)
      setHasAudio(gotAudio)
      setHasVideo(gotVideo)
      
      const audioTrack = mediaStream.getAudioTracks()[0]
      const videoTrack = mediaStream.getVideoTracks()[0]
      
      if (audioTrack) {
        setAudioEnabled(audioTrack.enabled)
        try { setSelectedMicId(audioTrack.getSettings().deviceId) } catch(e){}
      }
      if (videoTrack) {
        setVideoEnabled(videoTrack.enabled)
        try { setSelectedCameraId(videoTrack.getSettings().deviceId) } catch(e){}
      }
      
      
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices()
        setAvailableMics(allDevices.filter(d => d.kind === 'audioinput'))
        setAvailableCameras(allDevices.filter(d => d.kind === 'videoinput'))
      } catch (e) {
        console.warn('[video] Could not enumerate devices')
      }

      return mediaStream
    } catch (err) {
      console.error('[video] Media access error:', err)
      setError(err.message)
      throw err
    }
  }, [])

  
  const toggleAudio = useCallback(() => {
    if (!localStreamRef.current) return
    
    const audioTracks = localStreamRef.current.getAudioTracks()
    if (audioTracks.length === 0) return
    
    const track = audioTracks[0]
    const newState = !track.enabled
    track.enabled = newState
    setAudioEnabled(newState)
    
    
    if (socketRef.current && roomIdRef.current) {
      socketRef.current.emit('media-state-changed', {
        roomId: roomIdRef.current,
        audioEnabled: newState,
        videoEnabled
      })
    }
  }, [audioEnabled, videoEnabled])

  
  const switchDevice = useCallback(async (kind, deviceId) => {
    try {
      const constraints = kind === 'audio' 
        ? { audio: { deviceId: { exact: deviceId } }, video: false }
        : { audio: false, video: { deviceId: { exact: deviceId } } }
        
      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      const newTrack = kind === 'audio' ? newStream.getAudioTracks()[0] : newStream.getVideoTracks()[0]
      
      if (!newTrack) return
      
      if (localStreamRef.current) {
        
        const oldTrack = kind === 'audio' 
          ? localStreamRef.current.getAudioTracks()[0]
          : localStreamRef.current.getVideoTracks()[0]
          
        if (oldTrack) {
          localStreamRef.current.removeTrack(oldTrack)
          oldTrack.stop()
        }
        
        
        localStreamRef.current.addTrack(newTrack)
        
        
        if (kind === 'audio' && !audioEnabled) newTrack.enabled = false
        if (kind === 'video' && !videoEnabled) newTrack.enabled = false
        
        
        peerConnections.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track && s.track.kind === (kind === 'audio' ? 'audio' : 'video'))
          if (sender) sender.replaceTrack(newTrack)
        })
        
        
        if (kind === 'audio') setSelectedMicId(deviceId)
        if (kind === 'video') setSelectedCameraId(deviceId)
        
        
        setLocalStream(new MediaStream(localStreamRef.current.getTracks()))
      }
    } catch (err) {
      console.error(`[video] Failed to switch ${kind} device:`, err)
      setError(`Failed to switch ${kind === 'audio' ? 'microphone' : 'camera'}. It may be in use by another application.`)
    }
  }, [audioEnabled, videoEnabled])

  
  const toggleVideo = useCallback(() => {
    if (!hasVideo || !localStreamRef.current) return
    
    const videoTracks = localStreamRef.current.getVideoTracks()
    if (videoTracks.length === 0) return
    
    const track = videoTracks[0]
    const newState = !track.enabled
    track.enabled = newState
    setVideoEnabled(newState)
    
    if (socketRef.current && roomIdRef.current) {
      socketRef.current.emit('media-state-changed', {
        roomId: roomIdRef.current,
        audioEnabled,
        videoEnabled: newState
      })
    }
  }, [hasVideo, audioEnabled])

  
  const createPeerConnection = useCallback((remoteSocketId, remoteUsername, remoteUserId) => {
    console.log('[video] Creating peer connection with:', remoteUsername)

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current)
      })
    }

    
    pc.ontrack = (event) => {
      console.log('[video] Got remote track from:', remoteUsername)
      setPeers(prev => {
        const newPeers = new Map(prev)
        newPeers.set(remoteSocketId, {
          stream: event.streams[0],
          username: remoteUsername,
          userId: remoteUserId
        })
        return newPeers
      })
    }

    
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          to: remoteSocketId,
          candidate: event.candidate
        })
      }
    }

    pc.onconnectionstatechange = () => {
      console.log('[video] Connection with', remoteUsername, ':', pc.connectionState)
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setPeers(prev => {
          const newPeers = new Map(prev)
          newPeers.delete(remoteSocketId)
          return newPeers
        })
        peerConnections.current.delete(remoteSocketId)
      }
    }

    peerConnections.current.set(remoteSocketId, pc)
    return pc
  }, [])

  
  const joinRoom = useCallback(async (targetRoomId, targetUsername) => {
    try {
      setError(null)
      setConnectionState('connecting')
      setUsername(targetUsername)
      setRoomId(targetRoomId)
      roomIdRef.current = targetRoomId
      setChatMessages([]) 

      await getLocalStream()

      const sock = io(SOCKET_URL, {
        path: '/socket.io',
        transports: ['websocket', 'polling']
      })

      
      
      const pendingCandidates = {}

      const flushCandidates = async (fromId) => {
        const pc = peerConnections.current.get(fromId)
        if (!pc || !pendingCandidates[fromId]) return
        const queue = pendingCandidates[fromId]
        pendingCandidates[fromId] = []
        for (const candidate of queue) {
          try { await pc.addIceCandidate(new RTCIceCandidate(candidate)) } catch (e) {  }
        }
      }

      
      sock.on('connect', () => {
        console.log('[video] Connected to signaling server')
        setConnectionState('connected')
        sock.emit('join-room', {
          roomId: targetRoomId,
          userId,
          username: targetUsername
        })
      })

      sock.on('connect_error', (err) => {
        console.log('[video] Connection error (will retry):', err.message)
        setConnectionState('disconnected')
      })

      
      
      sock.on('room-users', async ({ participants }) => {
        console.log('[video] People already in room:', participants.length)
        for (const participant of participants) {
          const pc = createPeerConnection(participant.socketId, participant.username, participant.userId)
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          sock.emit('offer', { to: participant.socketId, offer })
        }
      })

      
      
      
      sock.on('user-joined', ({ userId: remoteUserId, username: remoteUsername, socketId: remoteSocketId }) => {
        console.log('[video] User joined:', remoteUsername, '— waiting for their offer')
        
        
      })

      
      sock.on('offer', async ({ from, fromUsername, offer }) => {
        console.log('[video] Got offer from:', fromUsername)
        let pc = peerConnections.current.get(from)
        if (!pc) {
          pc = createPeerConnection(from, fromUsername, null)
        }
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        sock.emit('answer', { to: from, answer })
        
        await flushCandidates(from)
      })

      
      sock.on('answer', async ({ from, answer }) => {
        console.log('[video] Got answer from:', from)
        const pc = peerConnections.current.get(from)
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer))
          await flushCandidates(from)
        }
      })

      
      sock.on('ice-candidate', async ({ from, candidate }) => {
        const pc = peerConnections.current.get(from)
        if (pc && pc.remoteDescription) {
          try { await pc.addIceCandidate(new RTCIceCandidate(candidate)) } catch (e) {  }
        } else {
          
          if (!pendingCandidates[from]) pendingCandidates[from] = []
          pendingCandidates[from].push(candidate)
        }
      })

      
      sock.on('user-left', ({ socketId, username }) => {
        console.log('[video] User left:', username)
        setPeers(prev => {
          const newPeers = new Map(prev)
          newPeers.delete(socketId)
          return newPeers
        })
        const pc = peerConnections.current.get(socketId)
        if (pc) {
          pc.close()
          peerConnections.current.delete(socketId)
        }
      })

      
      sock.on('chat-message', (msg) => {
        setChatMessages(prev => [...prev, msg])
      })

      sock.on('room-full', () => {
        setError('Room is full (max 10 participants)')
        setConnectionState('disconnected')
      })

      setSocket(sock)
      socketRef.current = sock

    } catch (err) {
      console.error('[video] Error joining room:', err)
      setError(err.message)
      setConnectionState('disconnected')
    }
  }, [getLocalStream, createPeerConnection, userId])

  
  const leaveRoom = useCallback(() => {
    console.log('[video] Leaving room...')

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop())
      screenStreamRef.current = null
    }

    peerConnections.current.forEach(pc => pc.close())
    peerConnections.current.clear()

    if (socketRef.current) {
      socketRef.current.emit('leave-room', { roomId: roomIdRef.current })
      socketRef.current.disconnect()
    }

    
    setLocalStream(null)
    setPeers(new Map())
    setRoomId(null)
    setAudioEnabled(false)
    setVideoEnabled(false)
    setHasAudio(false)
    setHasVideo(false)
    setIsScreenSharing(false)
    setConnectionState('disconnected')
    setSocket(null)
    socketRef.current = null
    roomIdRef.current = null
    setChatMessages([])
  }, [])

  
  const sendMessage = useCallback((text) => {
    if (socketRef.current && roomIdRef.current && text.trim()) {
      socketRef.current.emit('chat-message', { roomId: roomIdRef.current, text })
      
      setChatMessages(prev => [...prev, {
        userId,
        username,
        text,
        timestamp: new Date().toISOString()
      }])
    }
  }, [userId, username])

  
  const startScreenShare = useCallback(async () => {
    try {
      console.log('[video] Starting screen share...')
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true, audio: false
      })

      screenStreamRef.current = screenStream
      setIsScreenSharing(true)

      const videoTrack = screenStream.getVideoTracks()[0]
      peerConnections.current.forEach((pc) => {
        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video')
        if (sender) {
          sender.replaceTrack(videoTrack)
        }
      })

      
      videoTrack.onended = () => {
        stopScreenShare()
      }

      if (socketRef.current && roomIdRef.current) {
        socketRef.current.emit('screen-share-started', { roomId: roomIdRef.current })
      }
    } catch (err) {
      console.error('[video] Screen share error:', err)
      setError('Failed to start screen sharing')
    }
  }, [])

  const stopScreenShare = useCallback(() => {
    console.log('[video] Stopping screen share...')

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop())
      screenStreamRef.current = null
    }

    
    if (localStreamRef.current && hasVideo) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      peerConnections.current.forEach((pc) => {
        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video')
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack)
        }
      })
    }

    setIsScreenSharing(false)

    if (socketRef.current && roomIdRef.current) {
      socketRef.current.emit('screen-share-stopped', { roomId: roomIdRef.current })
    }
  }, [hasVideo])

  
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop())
      }
      peerConnections.current.forEach(pc => pc.close())
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  return {
    roomId, userId, username, localStream, peers,
    audioEnabled, videoEnabled, hasAudio, hasVideo,
    isScreenSharing, connectionState, error,
    availableMics, availableCameras, selectedMicId, selectedCameraId,
    chatMessages,
    joinRoom, leaveRoom, toggleAudio, toggleVideo, switchDevice,
    startScreenShare, stopScreenShare, setError, sendMessage
  }
}
