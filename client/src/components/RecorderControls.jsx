

import { useCallback } from 'react'

export default function RecorderControls({
  isRecording, busy, socketStatus, micError, onStart, onStop
}) {
  const handleStart = useCallback((e) => {
    e.preventDefault()
    if (onStart) onStart()
  }, [onStart])

  const handleStop = useCallback((e) => {
    e.preventDefault()
    if (onStop) onStop()
  }, [onStop])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {!isRecording ? (
          <button
            className="btn-primary"
            onClick={handleStart}
            disabled={busy}
            style={{
              padding: '16px 32px', fontSize: '1.1rem',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}
          >
            {busy ? (
              <>
                <span className="loading-spinner" style={{ width: '20px', height: '20px', margin: 0 }}></span>
                Starting...
              </>
            ) : (
              <>
                <span style={{ fontSize: '1.3rem' }}>🎙️</span>
                Start Recording
              </>
            )}
          </button>
        ) : (
          <button
            className="btn-danger"
            onClick={handleStop}
            style={{
              padding: '16px 32px', fontSize: '1.1rem',
              display: 'flex', alignItems: 'center', gap: '12px',
              animation: 'pulse 2s infinite'
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>⏹️</span>
            Stop Recording
          </button>
        )}

        {}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', background: 'var(--bg-tertiary)',
            borderRadius: '10px', border: '1px solid var(--border-color)'
          }}>
            <div className={`status-dot ${socketStatus}`}></div>
            <span style={{
              fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500'
            }}>
              {socketStatus === 'connected' ? 'Connected' :
               socketStatus === 'connecting' ? 'Connecting...' :
               socketStatus === 'error' ? 'Error' : 'Disconnected'}
            </span>
          </div>

          {isRecording && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px',
              background: 'var(--danger-dim)',
              borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              animation: 'pulse 1.5s infinite'
            }}>
              <div style={{
                width: '10px', height: '10px',
                background: '#ef4444', borderRadius: '50%',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
              }}></div>
              <span style={{
                fontSize: '0.85rem', color: '#fca5a5', fontWeight: '600'
              }}>
                Recording
              </span>
            </div>
          )}
        </div>
      </div>

      {}
      {micError && (
        <div style={{
          background: 'var(--danger-dim)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px', padding: '16px',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🎤</span>
          <div>
            <p style={{ color: '#fca5a5', fontWeight: '600', marginBottom: '4px' }}>
              Microphone Error
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {micError}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
