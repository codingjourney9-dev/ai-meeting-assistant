




import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useVideoCall } from '../hooks/useVideoCall.js'
import { useAudioRecorder } from '../hooks/useAudioRecorder.js'
import { useTranscriptionSocket } from '../hooks/useTranscriptionSocket.js'
import { createMeeting } from '../api/apiClient.js'
import VideoGrid from '../components/VideoGrid.jsx'
import VideoControls from '../components/VideoControls.jsx'
import MeetingLink from '../components/MeetingLink.jsx'
import LiveTranscript from '../components/LiveTranscript.jsx'

function generateRoomId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function VideoRoom() {
  const { roomId: urlRoomId } = useParams()
  const navigate = useNavigate()

  const {
    roomId, username, localStream, peers,
    audioEnabled, videoEnabled, hasAudio, hasVideo,
    isScreenSharing, connectionState, error,
    availableMics, availableCameras, selectedMicId, selectedCameraId,
    chatMessages,
    joinRoom, leaveRoom, toggleAudio, toggleVideo, switchDevice,
    startScreenShare, stopScreenShare, setError, sendMessage
  } = useVideoCall()

  const recorder = useAudioRecorder()
  const socket = useTranscriptionSocket()

  const { user } = useAuth()
  const [inputUsername, setInputUsername] = useState(user?.name || '')
  const [inputRoomId, setInputRoomId]     = useState(urlRoomId || '')
  const [isJoining, setIsJoining]         = useState(false)
  const [inCall, setInCall]               = useState(false)
  const [activeRoomId, setActiveRoomId]   = useState(urlRoomId || '')
  const [tab, setTab]                     = useState(urlRoomId ? 'join' : 'create')

  
  useEffect(() => {
    if (user?.name && !inputUsername) {
      setInputUsername(user.name)
    }
  }, [user, inputUsername])

  const [recordingMeeting, setRecordingMeeting] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [justStoppedRecording, setJustStoppedRecording] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [sidebarTab, setSidebarTab] = useState('chat') 
  const [chatInput, setChatInput] = useState('')

  const handleSendChat = (e) => {
    e.preventDefault()
    if (chatInput.trim()) {
      sendMessage(chatInput)
      setChatInput('')
    }
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    if (!inputUsername.trim()) { setError('Please enter your name'); return }

    const targetRoomId = tab === 'join'
      ? (inputRoomId.trim() || generateRoomId())
      : generateRoomId()

    setIsJoining(true)
    try {
      
      try {
        const res = await fetch('/socket.io/?EIO=4&transport=polling')
        console.log('[video] Socket.IO handshake status:', res.status)
      } catch (pingErr) {
        console.error('[video] Socket.IO endpoint unreachable:', pingErr.message)
        setError(`Cannot reach video server: ${pingErr.message}. Is the backend running?`)
        setIsJoining(false)
        return
      }

      await joinRoom(targetRoomId, inputUsername.trim())
      setActiveRoomId(targetRoomId)
      setInCall(true)
      window.history.replaceState(null, '', `/video/${targetRoomId}`)
    } catch (err) {
      console.error('[video] Join failed:', err)
      setError(err.message)
    } finally {
      setIsJoining(false)
    }
  }

  const handleLeave = () => {
    leaveRoom()
    if (isRecording) {
      handleStopRecording()
    }
    setInCall(false)
    navigate('/')
  }

  const handleStartRecording = async () => {
    try {
      console.log('[video] Starting recording... localStream:', !!localStream)
      const title = `Video Meeting - ${activeRoomId}`
      const meeting = await createMeeting(title)
      setRecordingMeeting(meeting)
      socket.resetTranscript()
      await socket.connect(meeting._id)
      console.log('[video] STT Socket connected, starting audio recorder...')
      await recorder.startRecording(socket.sendAudioChunk, null, localStream)
      console.log('[video] Audio recorder started successfully. recorder.isRecording:', recorder.isRecording)
      setIsRecording(true)
      setJustStoppedRecording(false)
    } catch (err) {
      console.error('[video] Recording start failed:', err)
      setError('Failed to start recording: ' + err.message)
    }
  }

  const handleStopRecording = () => {
    recorder.stopRecording(true) 
    socket.disconnect()
    setIsRecording(false)
    setJustStoppedRecording(true)
    setSidebarTab('transcript') 
  }

  
  if (!inCall) {
    return (
      <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>

        <div className="card-elevated" style={{ width: '100%', maxWidth: 480 }}>
          {}
          <div style={{ height: 4, background: 'var(--text-primary)', margin: '-28px -28px 24px', borderRadius: 'var(--r-xl) var(--r-xl) 0 0' }} />

          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4, color: 'var(--text-primary)' }}>
            Video Meeting
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
            Connect with your team via peer-to-peer video
          </p>

          {}
          {error && (
            <div className="banner banner-danger" style={{ marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          {}
          <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: 'var(--r-md)', padding: 4, marginBottom: 24, gap: 4 }}>
            {['create', 'join'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '9px 16px', borderRadius: 'calc(var(--r-md) - 2px)', fontSize: '0.875rem', fontWeight: 600,
                  background: tab === t ? 'var(--bg-card)' : 'transparent',
                  color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: 'none', cursor: 'pointer', transition: 'var(--t-fast)',
                  boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {t === 'create' ? '✨ Create Room' : '🔗 Join Room'}
              </button>
            ))}
          </div>

          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label>Your Name</label>
              <input
                type="text"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                placeholder="Enter your name"
                required
                autoFocus
              />
            </div>

            {tab === 'join' && (
              <div>
                <label>Room ID</label>
                <input
                  type="text"
                  value={inputRoomId}
                  onChange={(e) => setInputRoomId(e.target.value)}
                  placeholder="Paste the room ID here"
                />
              </div>
            )}

            {}
            {(availableMics.length > 0 || availableCameras.length > 0) && (
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                {availableMics.length > 0 && (
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem' }}>Microphone</label>
                    <select 
                      value={selectedMicId} 
                      onChange={(e) => switchDevice('audio', e.target.value)}
                      style={{ padding: '8px', fontSize: '0.85rem' }}
                    >
                      {availableMics.map(m => (
                        <option key={m.deviceId} value={m.deviceId}>{m.label || 'Default Mic'}</option>
                      ))}
                    </select>
                  </div>
                )}
                {availableCameras.length > 0 && (
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem' }}>Camera</label>
                    <select 
                      value={selectedCameraId} 
                      onChange={(e) => switchDevice('video', e.target.value)}
                      style={{ padding: '8px', fontSize: '0.85rem' }}
                    >
                      {availableCameras.map(c => (
                        <option key={c.deviceId} value={c.deviceId}>{c.label || 'Default Camera'}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={isJoining || !inputUsername.trim()}
              style={{ justifyContent: 'center', padding: '14px', fontSize: '1rem', marginTop: 4 }}
            >
              {isJoining
                ? <><div className="spinner spinner-sm" /> Joining…</>
                : tab === 'create'
                  ? '✨ Create New Room'
                  : '🔗 Join Meeting'
              }
            </button>
          </form>

          <div className="divider" />

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['P2P video — works without a camera (mic only)', 'Up to 10 participants per room', 'Share the link to invite others'].map(tip => (
              <div key={tip} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--success)' }}>✓</span> {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  
  const participantCount = (peers?.size || 0) + 1
  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', margin: '-32px -36px', overflow: 'hidden' }}>

      {}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', background: 'rgba(17,17,38,0.98)',
        backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>📹 Video Meeting</h2>
          <span className="badge badge-accent" style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
            {activeRoomId}
          </span>
          <span className="badge badge-neutral">
            👥 {participantCount} participant{participantCount !== 1 ? 's' : ''}
          </span>
          {!hasVideo && <span className="badge badge-warning">🎤 Audio only</span>}
          {}
          <span className={`badge ${error ? 'badge-danger' : connectionState === 'connected' ? 'badge-success' : 'badge-warning'}`}>
            {connectionState === 'connected' ? '🟢 Signaling OK' : connectionState === 'connecting' ? '🟡 Connecting...' : '🔴 Signaling down'}
          </span>
          <button 
            className="btn-ghost" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            {isSidebarOpen ? 'Close Panel' : 'Open Chat'}
          </button>
        </div>
        <MeetingLink roomId={activeRoomId} />
      </div>

      {}
      {error && (
        <div className="banner banner-danger" style={{ margin: '12px 24px 0', borderRadius: 'var(--r-md)', zIndex: 10 }}>
          ⚠️ {error}
        </div>
      )}

      {}
      {showSettings && (
        <div style={{
          position: 'absolute', top: 80, right: 24, width: 320, zIndex: 100,
          background: 'rgba(26,26,46,0.95)', backdropFilter: 'blur(16px)',
          border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-lg)', padding: 20
        }} className="animate-fadeIn">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>⚙️ Device Settings</h3>
            <button onClick={() => setShowSettings(false)} className="btn-icon" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>✕</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Microphone</label>
              <select 
                value={selectedMicId} 
                onChange={(e) => switchDevice('audio', e.target.value)}
                style={{ width: '100%' }}
              >
                {availableMics.map(m => (
                  <option key={m.deviceId} value={m.deviceId}>{m.label || 'Default Microphone'}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Camera</label>
              <select 
                value={selectedCameraId} 
                onChange={(e) => switchDevice('video', e.target.value)}
                style={{ width: '100%' }}
              >
                {availableCameras.map(c => (
                  <option key={c.deviceId} value={c.deviceId}>{c.label || 'Default Camera'}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: 'var(--bg-base)' }}>
        
        {}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <VideoGrid
            localStream={localStream}
            peers={peers}
            username={username}
            audioEnabled={audioEnabled}
            videoEnabled={videoEnabled}
            hasVideo={hasVideo}
            isScreenSharing={isScreenSharing}
          />
        </div>

        {}
        {isSidebarOpen && (
          <div className="animate-slideLeft" style={{ 
            width: '380px', borderLeft: '1px solid var(--border)', background: 'var(--bg-secondary)', 
            display: 'flex', flexDirection: 'column', overflow: 'hidden' 
          }}>
            {}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <button 
                onClick={() => setSidebarTab('chat')}
                style={{ 
                  flex: 1, padding: '14px', background: sidebarTab === 'chat' ? 'transparent' : 'rgba(0,0,0,0.2)', 
                  border: 'none', borderBottom: sidebarTab === 'chat' ? '2px solid var(--accent)' : '2px solid transparent',
                  color: sidebarTab === 'chat' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600
                }}
              >
                💬 Chat
              </button>
              <button 
                onClick={() => setSidebarTab('transcript')}
                style={{ 
                  flex: 1, padding: '14px', background: sidebarTab === 'transcript' ? 'transparent' : 'rgba(0,0,0,0.2)', 
                  border: 'none', borderBottom: sidebarTab === 'transcript' ? '2px solid var(--accent)' : '2px solid transparent',
                  color: sidebarTab === 'transcript' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600
                }}
              >
                🎙️ Transcript {isRecording && <span className="rec-dot" style={{ display: 'inline-block', marginLeft: 6 }} />}
              </button>
            </div>

            {}
            {sidebarTab === 'chat' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {chatMessages.length === 0 ? (
                    <div className="empty-state" style={{ marginTop: 40 }}>
                      <div className="empty-state-icon">💬</div>
                      <div className="empty-state-title">No messages yet</div>
                      <div className="empty-state-desc">Say hi to everyone in the room!</div>
                    </div>
                  ) : (
                    chatMessages.map((msg, i) => {
                      const isMe = msg.username === username;
                      return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>{msg.username} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <div style={{ 
                            background: isMe ? 'var(--accent)' : 'var(--bg-tertiary)', 
                            color: isMe ? 'var(--bg-base)' : 'var(--text-primary)',
                            padding: '8px 12px', borderRadius: '12px', fontSize: '0.9rem',
                            maxWidth: '85%', wordBreak: 'break-word',
                            borderBottomRightRadius: isMe ? 2 : 12,
                            borderBottomLeftRadius: !isMe ? 2 : 12
                          }}>
                            {msg.text}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
                <form onSubmit={handleSendChat} style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, background: 'var(--bg-card)' }}>
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
                  />
                  <button type="submit" disabled={!chatInput.trim()} className="btn-primary" style={{ borderRadius: '50%', width: 40, height: 40, padding: 0, justifyContent: 'center' }}>
                    ➤
                  </button>
                </form>
              </div>
            )}

            {}
            {sidebarTab === 'transcript' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {justStoppedRecording && recordingMeeting && (
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(16,185,129,0.1)' }}>
                    <p style={{ margin: '0 0 12px', fontSize: '0.9rem' }}>Meeting saved successfully.</p>
                    <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate(`/meeting/${recordingMeeting._id}`)}>
                      ✨ View Summary
                    </button>
                  </div>
                )}

                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                  {(!isRecording && !justStoppedRecording) ? (
                    <div className="empty-state" style={{ marginTop: 40 }}>
                      <div className="empty-state-icon">🎙️</div>
                      <div className="empty-state-title">Not Recording</div>
                      <div className="empty-state-desc">Click the record button to start transcribing this meeting.</div>
                    </div>
                  ) : (
                    <LiveTranscript
                      segments={socket.segments}
                      interimText={socket.interimText}
                      isRecording={isRecording}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {}
      <VideoControls
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        hasAudio={hasAudio}
        hasVideo={hasVideo}
        isScreenSharing={isScreenSharing}
        isRecording={isRecording}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={isScreenSharing ? stopScreenShare : startScreenShare}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onSettingsClick={() => setShowSettings(!showSettings)}
        onLeave={handleLeave}
      />
    </div>
  )
}
