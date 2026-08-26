

import { generateMeetingSummary } from '../services/summarizationService.js';
import { Meeting } from '../models/Meeting.js';
import { TranscriptSegment } from '../models/TranscriptSegment.js';


export async function generateSummary(req, res, next) {
  try {
    const { meetingId } = req.params;

    
    const meeting = await Meeting.findOne({ _id: meetingId, userId: req.user._id });
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    
    
    const segments = await TranscriptSegment.find({ meetingId, isFinal: true })
      .sort({ timestamp: 1 })
      .lean();
    const transcriptText = segments.map((s) => s.text).join(' ');

    if (!transcriptText) {
      return res.status(422).json({
        error:
          'No transcript to summarize — record some audio for this meeting first.',
      });
    }

    
    const summary = await generateMeetingSummary(transcriptText);

    
    meeting.summary = summary;
    meeting.status = 'summarized';

    
    if (summary.actionItems && summary.actionItems.length > 0) {
      summary.actionItems.forEach(aiText => {
        
        
        const parts = aiText.split(/ - | : /);
        let description = aiText;
        let assignee = '';
        if (parts.length > 1 && parts[parts.length-1].includes('@')) {
          assignee = parts.pop().trim();
          description = parts.join(' - ').trim();
        }
        
        meeting.tasks.push({
          description,
          assignee,
          completed: false
        });
      });
    }

    await meeting.save();

    res.status(201).json({ meetingId, summary });
  } catch (err) {
    next(err); 
  }
}


export async function getSummary(req, res, next) {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findOne({ _id: meetingId, userId: req.user._id }).select('summary').lean();
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    
    
    res.json({ meetingId, summary: meeting.summary?.overview ? meeting.summary : null });
  } catch (err) {
    next(err);
  }
}
