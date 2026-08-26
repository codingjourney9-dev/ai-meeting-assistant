

import { useState } from 'react'

export default function MeetingLink({ roomId }) {
  const [copied, setCopied] = useState(false)
  const meetingLink = `${window.location.origin}/video/${roomId}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(meetingLink)
    } catch {
      const el = document.createElement('textarea')
      el.value = meetingLink
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)', overflow: 'hidden',
      }}>
        <span style={{ padding: '7px 12px', fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--text-primary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {meetingLink}
        </span>
        <button
          onClick={copy}
          style={{
            background: copied ? 'var(--success)' : 'var(--bg-hover)',
            border: 'none', borderLeft: '1px solid var(--border)',
            color: copied ? '#fff' : 'var(--text-secondary)',
            padding: '7px 14px', fontSize: '0.8rem', fontWeight: 600,
            cursor: 'pointer', transition: 'var(--t-fast)', whiteSpace: 'nowrap',
          }}
        >
          {copied ? '✓ Copied' : '🔗 Copy'}
        </button>
      </div>
    </div>
  )
}
