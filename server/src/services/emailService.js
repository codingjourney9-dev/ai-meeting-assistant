import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

function getRecipientsFromMeetingOrEnv(meeting) {
  if (meeting?.recipients && Array.isArray(meeting.recipients) && meeting.recipients.length) {
    return meeting.recipients;
  }
  
  if (env.ACTION_ITEM_RECIPIENTS) {
    return env.ACTION_ITEM_RECIPIENTS.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

export async function sendActionItemsEmail(meeting) {
  const recipients = getRecipientsFromMeetingOrEnv(meeting);

  if (!recipients.length) {
    console.warn('[email] No recipients configured for action items; skipping email.');
    return { sent: false, reason: 'no-recipients' };
  }

  const subject = `Action items: ${meeting.title || 'Meeting'} (${meeting._id})`;
  let text = `Action items generated for meeting: ${meeting.title || meeting._id}\n\n`;

  if (meeting.summary?.overview) {
    text += `Overview:\n${meeting.summary.overview}\n\n`;
  }

  if (meeting.summary?.actionItems && meeting.summary.actionItems.length) {
    text += 'Action Items:\n';
    meeting.summary.actionItems.forEach((a, i) => {
      text += `${i + 1}. ${a}\n`;
    });
    text += '\n';
  } else {
    text += 'No action items were extracted.\n\n';
  }

  if (meeting.summary?.decisions && meeting.summary.decisions.length) {
    text += 'Decisions:\n';
    meeting.summary.decisions.forEach((d, i) => {
      text += `${i + 1}. ${d}\n`;
    });
    text += '\n';
  }

  if (!resend) {
    console.log('[email] Resend API key not configured — would send to:', recipients);
    console.log('[email] Subject:', subject);
    console.log('[email] Body:\n', text);
    return { sent: false, reason: 'resend-not-configured' };
  }

  try {
    const fromEmail = env.MAIL_FROM && env.MAIL_FROM.includes('@') ? env.MAIL_FROM : 'onboarding@resend.dev';
    
    const { data, error } = await resend.emails.send({
      from: `Meeting Assistant <${fromEmail}>`,
      to: recipients,
      subject,
      text,
    });
    
    if (error) {
      console.error('[email] Failed to send action items email:', error.message);
      return { sent: false, reason: error.message };
    }

    console.log('[email] Action items emailed:', data.id);
    return { sent: true, data };
  } catch (err) {
    console.error('[email] Failed to send action items email:', err?.message || err);
    return { sent: false, reason: err?.message || 'send-failed' };
  }
}
