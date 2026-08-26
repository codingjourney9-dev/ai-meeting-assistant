

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMeeting, getSummary } from '../api/apiClient.js'
import SummaryPanel from '../components/SummaryPanel.jsx'
import TaskPanel from '../components/TaskPanel.jsx'

function StatusBadge({ status }) {
  if (status === 'summarized') return <span className="badge badge-success">✨ Summarized</span>
  if (status === 'completed')  return <span className="badge badge-info">✅ Completed</span>
  return <span className="badge badge-warning">🎙️ {status}</span>
}

export default function MeetingDetail() {
  const { meetingId } = useParams()
  const navigate = useNavigate()

  const [meeting, setMeeting] = useState(null)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const m = await getMeeting(meetingId)
        if (!cancelled) setMeeting(m)
        const s = await getSummary(meetingId)
        if (!cancelled) setSummary(s.summary)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [meetingId])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 16 }}>
      <div className="spinner" />
      <span style={{ color: 'var(--text-secondary)' }}>Loading meeting…</span>
    </div>
  )

  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.4 }}>❌</div>
      <h2 style={{ marginBottom: 8, color: '#fca5a5' }}>Failed to load meeting</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{error}</p>
      <button className="btn-primary" onClick={() => navigate('/')}>← Back to Dashboard</button>
    </div>
  )

  if (!meeting) return null

  const wordCount = meeting.transcript?.reduce((acc, seg) => acc + seg.text.split(' ').length, 0) || 0
  const createdDate = new Date(meeting.createdAt)

  return (
    <div className="animate-fadeIn">

      {}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: '0.85rem' }} onClick={() => navigate('/')}>
          ← Dashboard
        </button>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
          {meeting.title}
        </span>
      </div>

      {}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 className="page-title">{meeting.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
              <StatusBadge status={meeting.status} />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                📅 {createdDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                🕐 {createdDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {wordCount > 0 && (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  📝 {wordCount.toLocaleString()} words
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24, alignItems: 'start' }}>

        {}
        <div className="card-elevated" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="section-title" style={{ marginBottom: 16 }}>
            <span className="title-icon">📝</span>
            Transcript
            {meeting.transcript?.length > 0 && (
              <span className="badge badge-neutral" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>
                {meeting.transcript.length} segments
              </span>
            )}
          </div>

          {meeting.transcript?.length > 0 ? (
            <div style={{ maxHeight: 560, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {meeting.transcript.map((seg, i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--r-md)',
                  borderLeft: '3px solid var(--accent)',
                }}>
                  <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.925rem', lineHeight: 1.65 }}>
                    {seg.text}
                  </p>
                  {seg.timestamp && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6, display: 'block' }}>
                      {new Date(seg.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-title">No transcript available</div>
              <div className="empty-state-desc">Transcripts appear here after recording with Deepgram transcription enabled.</div>
            </div>
          )}
        </div>

        {}
        <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <TaskPanel 
            meetingId={meetingId} 
            tasks={meeting.tasks || []} 
          />
          <SummaryPanel
            meetingId={meetingId}
            summary={summary}
            onSummaryGenerated={setSummary}
          />
        </div>

      </div>
    </div>
  )
}
