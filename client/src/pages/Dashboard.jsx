

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createMeeting } from '../api/apiClient.js'
import { useAudioRecorder } from '../hooks/useAudioRecorder.js'
import { useTranscriptionSocket } from '../hooks/useTranscriptionSocket.js'
import LiveTranscript from '../components/LiveTranscript.jsx'
import MeetingList from '../components/MeetingList.jsx'

const STATES = { IDLE: 'idle', RECORDING: 'recording', STOPPED: 'stopped' }

export default function Dashboard() {
  const recorder = useAudioRecorder()
  const socket = useTranscriptionSocket()
  const navigate = useNavigate()

  const [state, setState] = useState(STATES.IDLE)
  const [activeMeeting, setActiveMeeting] = useState(null)
  const [meetingTitle, setMeetingTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const handleStart = async () => {
    setBusy(true)
    setError(null)
    try {
      const title = meetingTitle.trim() || `Meeting — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
      const meeting = await createMeeting(title)
      setActiveMeeting(meeting)
      socket.resetTranscript()
      await socket.connect(meeting._id)
      await recorder.startRecording(socket.sendAudioChunk, recorder.selectedDeviceId)
      setState(STATES.RECORDING)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleStop = () => {
    recorder.stopRecording()
    socket.disconnect()
    setState(STATES.STOPPED)
  }

  const handleNewRecording = () => {
    setState(STATES.IDLE)
    setActiveMeeting(null)
    setMeetingTitle('')
    socket.resetTranscript()
  }

  return (
    <div className="animate-fadeIn" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px', alignItems: 'start' }}>

      {}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {}
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Record meetings and get AI-powered insights</p>
        </div>

        {}
        {error && (
          <div className="banner banner-danger animate-fadeIn">
            <span>⚠️</span>
            <span>{error}</span>
            <button className="btn-icon" style={{ marginLeft: 'auto', background: 'transparent', border: 'none' }} onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {}
        {recorder.error && (
          <div className="banner banner-danger animate-fadeIn">
            <span>🎤</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Microphone Error</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{recorder.error}</div>
            </div>
          </div>
        )}

        {}
        {state === STATES.IDLE && (
          <div className="glass-panel animate-slideUp">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div className="section-title" style={{ margin: 0 }}>
                <span className="title-icon">🎙️</span>
                New Recording
              </div>
            </div>

            {}
            <div style={{ marginBottom: 20 }}>
              <label>Meeting Title (optional)</label>
              <input
                type="text"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="e.g. Weekly Sync, Product Review…"
                onKeyDown={(e) => e.key === 'Enter' && !busy && handleStart()}
              />
            </div>

            {}
            <div style={{ marginBottom: 24 }}>
              <label>Microphone</label>
              <select
                value={recorder.selectedDeviceId}
                onChange={(e) => recorder.setSelectedDeviceId?.(e.target.value)}
              >
                {(recorder.devices || []).length === 0 ? (
                  <option value="">Default microphone</option>
                ) : (
                  recorder.devices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Microphone ${d.deviceId.slice(0, 8)}`}
                    </option>
                  ))
                )}
              </select>
            </div>

            {}
            <button
              className="btn-record"
              onClick={handleStart}
              disabled={busy}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {busy ? (
                <><div className="spinner spinner-sm" />&nbsp;Starting…</>
              ) : (
                <><span style={{ fontSize: '1.2rem' }}>🎙️</span> Start Recording</>
              )}
            </button>

            {}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <div className="divider" style={{ flex: 1, margin: 0 }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>or</span>
              <div className="divider" style={{ flex: 1, margin: 0 }} />
            </div>
            <button
              className="btn-ghost"
              onClick={() => navigate('/video')}
              style={{ width: '100%', marginTop: 14, justifyContent: 'center' }}
            >
              <span>📹</span> Start Video Meeting
            </button>
          </div>
        )}

        {}
        {state === STATES.RECORDING && (
          <div className="glass-panel animate-slideUp" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div className="section-title" style={{ margin: 0 }}>
                <span className="title-icon">🎙️</span>
                {activeMeeting?.title || 'Recording…'}
              </div>
              <span className="rec-indicator"><span className="rec-dot" />REC</span>
            </div>

            {}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span className={`status-dot ${socket.status}`} />
              {socket.status === 'connected' ? 'Transcription active' : socket.status === 'connecting' ? 'Connecting…' : 'Not connected'}
            </div>

            <LiveTranscript
              segments={socket.segments}
              interimText={socket.interimText}
              isRecording={recorder.isRecording}
            />

            <button
              className="btn-stop"
              onClick={handleStop}
              style={{ width: '100%', marginTop: 20, justifyContent: 'center' }}
            >
              <span style={{ fontSize: '1.1rem' }}>⏹️</span> Stop Recording
            </button>
          </div>
        )}

        {}
        {state === STATES.STOPPED && activeMeeting && (
          <div className="glass-panel animate-slideUp" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, background: 'var(--success-dim)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>✅</div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>Recording saved!</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {socket.segments.length} segments captured
                </div>
              </div>
            </div>

            {}
            {socket.segments.length > 0 && (
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 16, maxHeight: 120, overflowY: 'auto', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {socket.segments.slice(0, 3).map((s, i) => <p key={i} style={{ margin: '0 0 4px' }}>{s.text}</p>)}
                {socket.segments.length > 3 && <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>…and {socket.segments.length - 3} more</p>}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => navigate(`/meeting/${activeMeeting._id}`)}
              >
                <span>✨</span> View &amp; Generate Summary
              </button>
              <button className="btn-ghost" onClick={handleNewRecording}>
                + New
              </button>
            </div>
          </div>
        )}

        {}
        {state === STATES.IDLE && (
          <div className="glass-card animate-fadeIn" style={{ display: 'flex', gap: 24, marginTop: 12 }}>
            {[
              { icon: '🎙️', title: 'Record', desc: 'Capture meeting audio in real-time' },
              { icon: '📝', title: 'Transcribe', desc: 'Deepgram converts speech to text live' },
              { icon: '✨', title: 'Summarize', desc: 'OpenAI extracts key points & actions' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: 12, opacity: 0.9 }}>{icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4, letterSpacing: '0.02em' }}>{title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="section-title" style={{ margin: 0 }}>
            <span className="title-icon">📋</span>
            Recent Meetings
          </div>
        </div>
        <MeetingList onOpenMeeting={(id) => navigate(`/meeting/${id}`)} />
      </div>

    </div>
  )
}
