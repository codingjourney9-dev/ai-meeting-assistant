

import { useEffect, useRef } from 'react'

function VideoTile({ stream, username, isMuted, isVideoOff, isLocal, isScreenSharing }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const showVideo = stream && !isVideoOff

  return (
    <div style={{
      position: 'relative',
      background: 'var(--bg-secondary)',
      borderRadius: 14,
      overflow: 'hidden',
      aspectRatio: '16/9',
      minHeight: 200,
      border: isScreenSharing ? '2px solid var(--accent)' : '1px solid var(--border)',
      boxShadow: 'var(--shadow-md)',
      transition: 'var(--t-fast)',
    }}>
      {}
      {isScreenSharing && (
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, padding: '3px 10px', background: 'var(--accent)', color: '#fff', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em' }}>
          🖥️ SHARING
        </div>
      )}

      {}
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))',
          flexDirection: 'column', gap: 8,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--text-primary)',
            color: 'var(--bg-base)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', fontWeight: 800,
            boxShadow: 'var(--shadow-sm)',
            border: '2px solid var(--border)',
            flexShrink: 0
          }}>
            {(username || '?').charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Camera off</span>
        </div>
      )}

      {}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '20px 12px 10px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
          <span style={{ width: 7, height: 7, background: '#10b981', borderRadius: '50%', boxShadow: '0 0 5px rgba(16,185,129,0.8)' }} />
          {username}{isLocal ? ' (You)' : ''}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {isMuted    && <span style={{ background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 6, fontSize: '0.8rem' }}>🔇</span>}
          {isVideoOff && <span style={{ background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 6, fontSize: '0.8rem' }}>📷</span>}
        </div>
      </div>
    </div>
  )
}

export default function VideoGrid({ localStream, peers, username, audioEnabled, videoEnabled, hasVideo, isScreenSharing }) {
  const totalCount = (peers?.size || 0) + 1
  const cols = totalCount === 1 ? 1 : totalCount <= 4 ? 2 : 3

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 12, padding: 16,
      alignContent: 'center',
      background: 'var(--bg-base)',
      backgroundImage: 'radial-gradient(ellipse at center, rgba(99,102,241,0.05), transparent 70%)',
      overflowY: 'auto',
      boxSizing: 'border-box',
    }}>
      {}
      <VideoTile
        stream={localStream}
        username={username}
        isMuted={!audioEnabled}
        isVideoOff={!hasVideo || !videoEnabled}
        isLocal={true}
        isScreenSharing={isScreenSharing}
      />

      {}
      {Array.from(peers.entries()).map(([socketId, peer]) => (
        <VideoTile
          key={socketId}
          stream={peer.stream}
          username={peer.username}
          isMuted={false}
          isVideoOff={false}
          isLocal={false}
          isScreenSharing={false}
        />
      ))}
    </div>
  )
}
