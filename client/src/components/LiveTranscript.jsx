

import { useEffect, useRef, useState, useCallback } from 'react'

export default function LiveTranscript({ segments, interimText, isRecording }) {
  const bottomRef    = useRef(null)
  const containerRef = useRef(null)
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [segments, interimText, autoScroll])

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      setAutoScroll(scrollHeight - scrollTop <= clientHeight + 40)
    }
  }, [])

  const isEmpty = segments.length === 0 && !interimText

  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      {}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          📝 Live Transcript
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {segments.length > 0 && (
            <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>{segments.length} segments</span>
          )}
          {isRecording && (
            <span className="rec-indicator" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
              <span className="rec-dot" />LIVE
            </span>
          )}
        </div>
      </div>

      {}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{ height: 240, overflowY: 'auto', padding: 16 }}
      >
        {isEmpty && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, color: 'var(--text-muted)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', opacity: 0.35 }}>{isRecording ? '🎤' : '📝'}</div>
            <p style={{ fontSize: '0.875rem' }}>
              {isRecording ? 'Listening… start speaking' : 'Start recording to see transcript'}
            </p>
          </div>
        )}

        {segments.map((seg, i) => (
          <div
            key={i}
            style={{ padding: '10px 14px', marginBottom: 6, background: 'var(--bg-card)', borderRadius: 'var(--r-md)', borderLeft: '3px solid var(--accent)', animation: 'fadeIn 0.25s ease' }}
          >
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>{seg.text}</p>
            {seg.timestamp && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                {new Date(seg.timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
        ))}

        {interimText && (
          <div style={{ padding: '10px 14px', marginBottom: 6, background: 'var(--accent-dim)', borderRadius: 'var(--r-md)', borderLeft: '3px solid var(--accent-light)', fontStyle: 'italic' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{interimText}</p>
          </div>
        )}

        {isRecording && (
          <div style={{ display: 'flex', gap: 4, padding: '6px 4px', justifyContent: 'center' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%', animation: `typing 1.2s infinite ${i * 0.18}s` }} />
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {}
      {!autoScroll && segments.length > 0 && (
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn-ghost"
            style={{ fontSize: '0.78rem', padding: '5px 12px' }}
            onClick={() => { setAutoScroll(true); containerRef.current.scrollTop = containerRef.current.scrollHeight }}
          >
            ↓ Latest
          </button>
        </div>
      )}

      <style>{`
        @keyframes typing {
          0%, 100% { opacity: 0.25; transform: scale(0.8); }
          50%       { opacity: 1;    transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
