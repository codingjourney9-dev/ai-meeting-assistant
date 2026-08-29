import { Meeting } from '../models/Meeting.js'
import { env } from '../config/env.js'
import { Resend } from 'resend'

const resend = new Resend(env.RESEND_API_KEY)

export async function addTask(req, res) {
  try {
    const { id } = req.params
    const { description, assignee } = req.body

    const meeting = await Meeting.findOne({ _id: id, userId: req.user._id })
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' })

    meeting.tasks.push({ description, assignee, completed: false })
    await meeting.save()

    res.json({ success: true, tasks: meeting.tasks })
  } catch (error) {
    console.error('[task] Add error:', error)
    res.status(500).json({ error: 'Failed to add task' })
  }
}

export async function toggleTask(req, res) {
  try {
    const { id, taskId } = req.params
    const meeting = await Meeting.findOne({ _id: id, userId: req.user._id })
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' })

    const task = meeting.tasks.id(taskId)
    if (!task) return res.status(404).json({ error: 'Task not found' })

    task.completed = !task.completed
    await meeting.save()

    res.json({ success: true, tasks: meeting.tasks })
  } catch (error) {
    console.error('[task] Toggle error:', error)
    res.status(500).json({ error: 'Failed to toggle task' })
  }
}

export async function dispatchEmails(req, res) {
  try {
    const { id } = req.params
    const meeting = await Meeting.findOne({ _id: id, userId: req.user._id })
    
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' })
    if (meeting.tasks.length === 0) return res.status(400).json({ error: 'No tasks to dispatch' })

    console.log(`[email] Dispatching tasks for meeting: ${meeting.title}`)

    const tasksByAssignee = {}
    meeting.tasks.forEach(task => {
      const email = task.assignee || env.ACTION_ITEM_RECIPIENTS?.split(',')[0] || 'unassigned'
      if (!tasksByAssignee[email]) tasksByAssignee[email] = []
      tasksByAssignee[email].push(task)
    })

    const results = []

    for (const [email, tasks] of Object.entries(tasksByAssignee)) {
      if (email === 'unassigned' || !email.includes('@')) {
        console.warn(`[email] Skipping invalid or unassigned email: ${email}`)
        continue
      }

      const taskListHtml = tasks.map(t => `<li>${t.description}</li>`).join('')

      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #6366f1; padding: 20px; color: white;">
            <h2 style="margin: 0;">Action Items Assigned</h2>
            <p style="margin: 5px 0 0; opacity: 0.9;">Meeting: ${meeting.title}</p>
          </div>
          <div style="padding: 20px;">
            <p>Hello,</p>
            <p>You have been assigned the following action items from the meeting <strong>${meeting.title}</strong>:</p>
            <ul style="background: #f9fafb; padding: 15px 15px 15px 35px; border-radius: 6px;">
              ${taskListHtml}
            </ul>
            <p>Please review and complete them at your earliest convenience.</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              Sent by Smart Meeting Assistant
            </p>
          </div>
        </div>
      `

      // Note: Free Resend accounts MUST send from onboarding@resend.dev
      const fromEmail = 'onboarding@resend.dev'

      try {
        const { data, error } = await resend.emails.send({
          from: `Meeting Assistant <${fromEmail}>`,
          replyTo: `${req.user.name} <${req.user.email}>`,
          to: [email],
          subject: `Action Items: ${meeting.title}`,
          html,
        })
        
        if (error) {
          console.error(`[email] Failed to send to ${email}:`, error.message)
          results.push({ email, success: false, error: error.message })
        } else {
          console.log(`[email] Sent to ${email}: ${data.id}`)
          results.push({ email, success: true })
        }
      } catch (err) {
        console.error(`[email] Failed to send to ${email}:`, err.message)
        results.push({ email, success: false, error: err.message })
      }
    }

    res.json({ success: true, results })
  } catch (error) {
    console.error('[email] Dispatch error:', error)
    res.status(500).json({ error: 'Failed to dispatch emails' })
  }
}
