

import { useState, useCallback } from 'react'
import { generateSummary } from '../api/apiClient.js'

function AccordionSection({ icon, title, items, emptyMsg, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  const hasItems = items && items.length > 0

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden', marginBottom: 8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', background: 'var(--bg-tertiary)', border: 'none',
          cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.875rem',
          fontWeight: 600, transition: 'var(--t-fast)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
      >
        <span>{icon}</span>
        <span style={{ flex: 1, textAlign: 'left' }}>{title}</span>
        {hasItems && <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{items.length}</span>}
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'var(--t-fast)' }}>▼</span>
      </button>

      {open && (
        <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)' }}>
          {!hasItems ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem', margin: 0 }}>{emptyMsg}</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--accent-light)', fontWeight: 700, marginTop: 1, flexShrink: 0, fontSize: '0.85rem' }}>
                    {title.includes('Action') ? '☐' : title.includes('Decision') ? '✓' : '•'}
                  </span>
                  <span style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default function SummaryPanel({ meetingId, summary, onSummaryGenerated }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [copied, setCopied]   = useState(false)

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await generateSummary(meetingId)
      onSummaryGenerated(result.summary)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [meetingId, onSummaryGenerated])

  const copyToClipboard = useCallback(async () => {
    if (!summary) return
    let text = 'MEETING SUMMARY\n================\n\n'
    text += (summary.overview || '') + '\n\n'
    if (summary.keyPoints?.length)   { text += 'KEY POINTS\n----------\n';   summary.keyPoints.forEach(p   => text += `• ${p}\n`); text += '\n' }
    if (summary.actionItems?.length) { text += 'ACTION ITEMS\n------------\n'; summary.actionItems.forEach(a => text += `☐ ${a}\n`); text += '\n' }
    if (summary.decisions?.length)   { text += 'DECISIONS\n---------\n';      summary.decisions.forEach(d   => text += `✓ ${d}\n`) }
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [summary])

  return (
    <div className="card-elevated">
      {}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="section-title" style={{ margin: 0 }}>
          <span className="title-icon">✨</span>
          AI Summary
        </div>
        {summary && (
          <button
            className="btn-ghost"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            onClick={copyToClipboard}
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        )}
      </div>

      {}
      {loading && (
        <div style={{ textAlign: 'center', padding: '32px 20px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 4 }}>Generating summary…</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Gemini AI is analyzing the transcript</p>
        </div>
      )}

      {}
      {error && !loading && (
        <div className="banner banner-danger" style={{ marginBottom: 16 }}>
          <span>⚠️</span>
          <span style={{ flex: 1, fontSize: '0.875rem' }}>{error}</span>
        </div>
      )}

      {}
      {!loading && !summary && (
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12, opacity: 0.35 }}>🤖</div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6, fontSize: '0.95rem' }}>No summary yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20, lineHeight: 1.6 }}>
            Gemini AI will extract key points, action items, and decisions from the transcript.
          </p>
          <button
            className="btn-primary"
            onClick={handleGenerate}
            style={{ justifyContent: 'center' }}
          >
            <span>✨</span> Generate Summary
          </button>
        </div>
      )}

      {}
      {!loading && summary && (
        <div>
          {}
          {summary.overview && (
            <div style={{ background: 'var(--accent-dim)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--r-md)', padding: '14px 16px', marginBottom: 10 }}>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-primary)' }}>{summary.overview}</p>
            </div>
          )}

          <AccordionSection icon="💡" title="Key Points"    items={summary.keyPoints}    emptyMsg="No key points identified" />
          <AccordionSection icon="✅" title="Action Items"  items={summary.actionItems}  emptyMsg="No action items identified" />
          <AccordionSection icon="🎯" title="Decisions"     items={summary.decisions}    emptyMsg="No decisions recorded" defaultOpen={false} />

          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <button
              className="btn-ghost"
              style={{ fontSize: '0.82rem', padding: '7px 16px' }}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? '⏳ Regenerating…' : '↻ Regenerate'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
