import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

function getRecipientsFromMeetingOrEnv(meeting) {
  
  if (meeting?.recipients && Array.isArray(meeting.recipients) && meeting.recipients.length) {
    return meeting.recipients;
  }
  
  if (env.ACTION_ITEM_RECIPIENTS) {
    return env.ACTION_ITEM_RECIPIENTS.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function createTransportIfConfigured() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT || 587,
    secure: !!env.SMTP_SECURE, 
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

export async function sendActionItemsEmail(meeting) {
  const recipients = getRecipientsFromMeetingOrEnv(meeting);

  
  if (!recipients.length) {
    console.warn('[email] No recipients configured for action items; skipping email.');
    return { sent: false, reason: 'no-recipients' };
  }

  const transporter = createTransportIfConfigured();

  
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

  
  if (!transporter) {
    console.log('[email] SMTP not configured — would send to:', recipients);
    console.log('[email] Subject:', subject);
    console.log('[email] Body:\n', text);
    return { sent: false, reason: 'smtp-not-configured' };
  }

  try {
    const info = await transporter.sendMail({
      from: env.MAIL_FROM,
      to: recipients.join(','),
      subject,
      text,
    });

    console.log('[email] Action items emailed:', info.messageId);
    return { sent: true, info };
  } catch (err) {
    console.error('[email] Failed to send action items email:', err?.message || err);
    return { sent: false, reason: err?.message || 'send-failed' };
  }
}
