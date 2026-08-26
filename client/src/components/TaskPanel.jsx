import { useState, useCallback } from 'react'
import { addTask, toggleTask, dispatchEmails } from '../api/apiClient.js'

export default function TaskPanel({ meetingId, tasks: initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks || [])
  const [newTask, setNewTask] = useState('')
  const [assignee, setAssignee] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isDispatching, setIsDispatching] = useState(false)
  const [dispatchResult, setDispatchResult] = useState(null)
  const [error, setError] = useState(null)

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) return

    setIsAdding(true)
    setError(null)
    try {
      const res = await addTask(meetingId, newTask, assignee)
      setTasks(res.tasks)
      setNewTask('')
      setAssignee('')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsAdding(false)
    }
  }

  const handleToggle = async (taskId) => {
    try {
      const res = await toggleTask(meetingId, taskId)
      setTasks(res.tasks)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDispatch = async () => {
    setIsDispatching(true)
    setError(null)
    setDispatchResult(null)
    try {
      const res = await dispatchEmails(meetingId)
      const successCount = res.results.filter(r => r.success).length
      setDispatchResult(`Successfully sent ${successCount} email(s)!`)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsDispatching(false)
    }
  }

  return (
    <div className="card-elevated" style={{ marginBottom: 24, borderColor: 'rgba(99, 102, 241, 0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="section-title" style={{ margin: 0 }}>
          <span className="title-icon">✅</span>
          Task Manager
        </div>
        {tasks.length > 0 && (
          <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>{tasks.filter(t => t.completed).length}/{tasks.length} Done</span>
        )}
      </div>

      {error && (
        <div className="banner banner-danger" style={{ marginBottom: 16 }}>
          <span>⚠️ {error}</span>
        </div>
      )}

      {dispatchResult && (
        <div className="banner banner-success" style={{ marginBottom: 16 }}>
          <span>✅ {dispatchResult}</span>
        </div>
      )}

      {}
      <div style={{ marginBottom: 16 }}>
        {tasks.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>No tasks assigned yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tasks.map(task => (
              <li key={task._id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--r-md)', opacity: task.completed ? 0.6 : 1 }}>
                <input 
                  type="checkbox" 
                  checked={task.completed} 
                  onChange={() => handleToggle(task._id)}
                  style={{ marginTop: 4, cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', textDecoration: task.completed ? 'line-through' : 'none' }}>
                    {task.description}
                  </p>
                  {task.assignee && (
                    <span style={{ display: 'inline-block', marginTop: 4, fontSize: '0.75rem', color: 'var(--accent-light)', background: 'var(--accent-dim)', padding: '2px 8px', borderRadius: '12px' }}>
                      @{task.assignee}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {}
      <form onSubmit={handleAddTask} style={{ display: 'flex', gap: 8, marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <input 
          type="text" 
          placeholder="New task..." 
          value={newTask} 
          onChange={(e) => setNewTask(e.target.value)} 
          style={{ flex: 2, padding: '8px 12px', fontSize: '0.85rem' }}
        />
        <input 
          type="email" 
          placeholder="Assignee Email (optional)" 
          value={assignee} 
          onChange={(e) => setAssignee(e.target.value)} 
          style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
        />
        <button type="submit" className="btn-primary" disabled={isAdding || !newTask.trim()} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          {isAdding ? '...' : 'Add'}
        </button>
      </form>

      {}
      {tasks.length > 0 && (
        <button 
          onClick={handleDispatch} 
          disabled={isDispatching}
          className="btn-primary" 
          style={{ width: '100%', marginTop: 16, justifyContent: 'center', background: 'var(--success)' }}
        >
          {isDispatching ? <><div className="spinner spinner-sm"/> Sending...</> : '📧 Dispatch Emails'}
        </button>
      )}
    </div>
  )
}
