


import { useCallback } from 'react'

export default function VideoControls({
  audioEnabled, videoEnabled, hasAudio, hasVideo, isScreenSharing,
  isRecording, onToggleAudio, onToggleVideo, onToggleScreenShare,
  onStartRecording, onStopRecording, onSettingsClick, onLeave
}) {
  const handleAudioClick = useCallback((e) => {
    e.preventDefault()
    if (onToggleAudio) onToggleAudio()
  }, [onToggleAudio])

  const handleVideoClick = useCallback((e) => {
    e.preventDefault()
    if (onToggleVideo) onToggleVideo()
  }, [onToggleVideo])

  const handleScreenShareClick = useCallback((e) => {
    e.preventDefault()
    if (onToggleScreenShare) onToggleScreenShare()
  }, [onToggleScreenShare])

  const handleRecordClick = useCallback((e) => {
    e.preventDefault()
    if (isRecording) {
      if (onStopRecording) onStopRecording()
    } else {
      if (onStartRecording) onStartRecording()
    }
  }, [isRecording, onStartRecording, onStopRecording])

  const handleSettingsClick = useCallback((e) => {
    e.preventDefault()
    if (onSettingsClick) onSettingsClick()
  }, [onSettingsClick])

  const handleLeaveClick = useCallback((e) => {
    e.preventDefault()
    if (onLeave) onLeave()
  }, [onLeave])

  
  const btnBase = {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '6px', padding: '14px 20px', borderRadius: '16px',
    border: '1px solid var(--border-color)', cursor: 'pointer',
    transition: 'all 0.3s ease', minWidth: '90px',
    position: 'relative', overflow: 'hidden'
  }

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', gap: '12px',
      padding: '20px 24px',
      background: 'rgba(26, 26, 46, 0.98)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border-color)'
    }}>
      {}
      <button
        onClick={handleAudioClick}
        disabled={!hasAudio}
        style={{
          ...btnBase,
          background: !hasAudio 
            ? 'var(--bg-tertiary)' 
            : audioEnabled 
              ? 'var(--text-primary)' 
              : 'var(--danger)',
          borderColor: !hasAudio ? 'var(--border)' : 'transparent',
          boxShadow: !hasAudio 
            ? 'none' 
            : audioEnabled 
              ? '0 4px 16px rgba(99, 102, 241, 0.4)' 
              : '0 4px 16px rgba(239, 68, 68, 0.4)',
          opacity: !hasAudio ? 0.5 : 1,
          cursor: !hasAudio ? 'not-allowed' : 'pointer'
        }}
        onMouseEnter={(e) => {
          if (hasAudio) {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = audioEnabled 
              ? '0 6px 20px rgba(99, 102, 241, 0.5)' 
              : '0 6px 20px rgba(239, 68, 68, 0.5)'
          }
        }}
        onMouseLeave={(e) => {
          if (hasAudio) {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = audioEnabled 
              ? '0 4px 16px rgba(99, 102, 241, 0.4)' 
              : '0 4px 16px rgba(239, 68, 68, 0.4)'
          }
        }}
      >
        <span style={{ fontSize: '1.4rem', position: 'relative', zIndex: 1, filter: audioEnabled ? 'brightness(0)' : 'none' }}>
          {audioEnabled ? '🎤' : '🔇'}
        </span>
        <span style={{
          fontSize: '0.75rem', fontWeight: '500', position: 'relative', zIndex: 1,
          color: !hasAudio ? 'var(--text-muted)' : audioEnabled ? 'var(--bg-base)' : 'white'
        }}>
          {!hasAudio ? 'No Mic' : audioEnabled ? 'Mute' : 'Unmute'}
        </span>
      </button>

      {}
      <button
        onClick={handleVideoClick}
        disabled={!hasVideo}
        style={{
          ...btnBase,
          background: !hasVideo 
            ? 'var(--bg-tertiary)' 
            : videoEnabled 
              ? 'var(--text-primary)' 
              : 'var(--danger)',
          borderColor: !hasVideo ? 'var(--border)' : 'transparent',
          boxShadow: !hasVideo 
            ? 'none' 
            : videoEnabled 
              ? '0 4px 16px rgba(99, 102, 241, 0.4)' 
              : '0 4px 16px rgba(239, 68, 68, 0.4)',
          opacity: !hasVideo ? 0.5 : 1,
          cursor: !hasVideo ? 'not-allowed' : 'pointer'
        }}
        onMouseEnter={(e) => {
          if (hasVideo) {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = videoEnabled 
              ? '0 6px 20px rgba(99, 102, 241, 0.5)' 
              : '0 6px 20px rgba(239, 68, 68, 0.5)'
          }
        }}
        onMouseLeave={(e) => {
          if (hasVideo) {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = videoEnabled 
              ? '0 4px 16px rgba(99, 102, 241, 0.4)' 
              : '0 4px 16px rgba(239, 68, 68, 0.4)'
          }
        }}
      >
        <span style={{ fontSize: '1.4rem', position: 'relative', zIndex: 1, filter: videoEnabled ? 'brightness(0)' : 'none' }}>
          {hasVideo ? (videoEnabled ? '📹' : '📷') : '📷'}
        </span>
        <span style={{
          fontSize: '0.75rem', fontWeight: '500', position: 'relative', zIndex: 1,
          color: !hasVideo ? 'var(--text-muted)' : videoEnabled ? 'var(--bg-base)' : 'white'
        }}>
          {!hasVideo ? 'No Camera' : videoEnabled ? 'Stop Video' : 'Start Video'}
        </span>
      </button>

      {}
      <button
        onClick={handleScreenShareClick}
        style={{
          ...btnBase,
          background: isScreenSharing 
            ? 'var(--success)' 
            : 'var(--bg-tertiary)',
          borderColor: isScreenSharing ? 'transparent' : 'var(--border)',
          boxShadow: isScreenSharing 
            ? '0 4px 16px rgba(16, 185, 129, 0.4)' 
            : 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          if (!isScreenSharing) {
            e.currentTarget.style.borderColor = 'var(--accent-primary)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.3)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          if (!isScreenSharing) {
            e.currentTarget.style.borderColor = 'var(--border-color)'
            e.currentTarget.style.boxShadow = 'none'
          }
        }}
      >
        <span style={{ fontSize: '1.4rem', position: 'relative', zIndex: 1 }}>
          {isScreenSharing ? '🖥️' : '💻'}
        </span>
        <span style={{
          fontSize: '0.75rem', fontWeight: '500', position: 'relative', zIndex: 1,
          color: isScreenSharing ? 'white' : 'var(--text-secondary)'
        }}>
          {isScreenSharing ? 'Stop Share' : 'Share Screen'}
        </span>
      </button>

      {}
      <button
        onClick={handleRecordClick}
        disabled={!hasAudio} 
        style={{
          ...btnBase,
          background: isRecording 
            ? 'var(--danger)' 
            : 'var(--bg-tertiary)',
          borderColor: isRecording ? 'transparent' : 'var(--border)',
          boxShadow: isRecording 
            ? '0 4px 16px rgba(239, 68, 68, 0.4)' 
            : 'none',
          opacity: !hasAudio ? 0.5 : 1,
          cursor: !hasAudio ? 'not-allowed' : 'pointer'
        }}
        onMouseEnter={(e) => {
          if (hasAudio) {
            e.currentTarget.style.transform = 'translateY(-2px)'
            if (!isRecording) {
              e.currentTarget.style.borderColor = 'var(--accent-primary)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.3)'
            } else {
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)'
            }
          }
        }}
        onMouseLeave={(e) => {
          if (hasAudio) {
            e.currentTarget.style.transform = 'translateY(0)'
            if (!isRecording) {
              e.currentTarget.style.borderColor = 'var(--border-color)'
              e.currentTarget.style.boxShadow = 'none'
            } else {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(239, 68, 68, 0.4)'
            }
          }
        }}
      >
        <span style={{ fontSize: '1.4rem', position: 'relative', zIndex: 1 }}>
          {isRecording ? '⏹️' : '⏺️'}
        </span>
        <span style={{
          fontSize: '0.75rem', fontWeight: '500', position: 'relative', zIndex: 1,
          color: isRecording ? 'white' : 'var(--text-secondary)'
        }}>
          {isRecording ? 'Stop Rec' : 'Record'}
        </span>
      </button>

      {}
      <button
        onClick={handleSettingsClick}
        style={{
          ...btnBase,
          background: 'var(--bg-tertiary)',
          borderColor: 'var(--border-color)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.borderColor = 'var(--accent-primary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.borderColor = 'var(--border-color)'
        }}
      >
        <span style={{ fontSize: '1.4rem', position: 'relative', zIndex: 1 }}>⚙️</span>
        <span style={{ fontSize: '0.75rem', fontWeight: '500', position: 'relative', zIndex: 1, color: 'var(--text-secondary)' }}>
          Settings
        </span>
      </button>

      {}
      <button
        onClick={handleLeaveClick}
        style={{
          ...btnBase,
          background: 'var(--danger)',
          borderColor: 'transparent',
          boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(239, 68, 68, 0.4)'
        }}
      >
        <span style={{ fontSize: '1.4rem', position: 'relative', zIndex: 1 }}>📞</span>
        <span style={{ fontSize: '0.75rem', fontWeight: '500', position: 'relative', zIndex: 1, color: 'white' }}>
          Leave
        </span>
      </button>
    </div>
  )
}
