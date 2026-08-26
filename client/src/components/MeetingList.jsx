

import { useEffect, useState, useCallback } from 'react'
import { listMeetings, deleteMeeting } from '../api/apiClient.js'

function SkeletonCard() {
  return (
    <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center' }}>
      <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skeleton" style={{ height: 14, width: '70%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 11, width: '45%', borderRadius: 4 }} />
      </div>
    </div>
  )
}

function statusLabel(status) {
  if (status === 'summarized') return { label: '✨ Summarized', cls: 'badge-success' }
  if (status === 'completed')  return { label: '✅ Done', cls: 'badge-info' }
  return { label: '🎙️ ' + status, cls: 'badge-warning' }
}

export default function MeetingList({ onOpenMeeting }) {
  const [meetings, setMeetings] = useState([])
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const refresh = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      const data = await listMeetings()
      setMeetings(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Delete this meeting? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await deleteMeeting(id)
      setMeetings(prev => prev.filter(m => m._id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
    </div>
  )

  if (error) return (
    <div className="banner banner-danger">
      <span>⚠️</span>
      <span style={{ flex: 1 }}>{error}</span>
      <button className="btn-icon" style={{ background: 'transparent', border: 'none' }} onClick={refresh}>↺</button>
    </div>
  )

  if (meetings.length === 0) return (
    <div className="empty-state" style={{ padding: '40px 20px' }}>
      <div className="empty-state-icon">📋</div>
      <div className="empty-state-title">No meetings yet</div>
      <div className="empty-state-desc">Record your first meeting to get started</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
      {meetings.map((meeting, index) => {
        const { label, cls } = statusLabel(meeting.status)
        const isDeleting = deletingId === meeting._id

        return (
          <div
            key={meeting._id}
            onClick={() => onOpenMeeting(meeting._id)}
            className="glass-card card-hover"
            style={{
              padding: '16px 20px',
              cursor: 'pointer',
              display: 'flex', gap: 16, alignItems: 'center',
              animation: `fadeIn 0.4s ease ${index * 0.08}s both`,
              opacity: isDeleting ? 0.4 : 1,
              marginBottom: 0
            }}
          >
            {}
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--r-md)', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: meeting.status === 'summarized' ? 'var(--success-dim)' : meeting.status === 'completed' ? 'rgba(59,130,246,0.12)' : 'var(--warning-dim)',
              fontSize: '1rem'
            }}>
              {meeting.status === 'summarized' ? '✨' : meeting.status === 'completed' ? '✅' : '🎙️'}
            </div>

            {}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
                {meeting.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className={`badge ${cls}`} style={{ fontSize: '0.7rem' }}>{label}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(meeting.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' · '}
                  {new Date(meeting.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {}
            <button
              onClick={(e) => handleDelete(e, meeting._id)}
              disabled={isDeleting}
              className="btn-icon"
              style={{ flexShrink: 0, opacity: 0.6 }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              title="Delete meeting"
            >
              🗑
            </button>
          </div>
        )
      })}
    </div>
  )
}
