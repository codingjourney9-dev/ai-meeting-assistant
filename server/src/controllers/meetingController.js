

import { Meeting } from '../models/Meeting.js';
import { TranscriptSegment } from '../models/TranscriptSegment.js';


export async function createMeeting(req, res, next) {
  try {
    const title = req.body?.title || `Meeting ${new Date().toLocaleString()}`;

    const meeting = await Meeting.create({ 
      title, 
      status: 'recording',
      userId: req.user._id 
    });

    res.status(201).json(meeting);
  } catch (err) {
    next(err); 
  }
}


export async function listMeetings(req, res, next) {
  try {
    
    const meetings = await Meeting.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(meetings);
  } catch (err) {
    next(err);
  }
}


export async function getMeeting(req, res, next) {
  try {
    const meeting = await Meeting.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    
    const transcript = await TranscriptSegment.find({
      meetingId: meeting._id,
      isFinal: true,
    })
      .sort({ timestamp: 1 })
      .select('text timestamp -_id')
      .lean();

    res.json({ ...meeting, transcript });
  } catch (err) {
    next(err);
  }
}


export async function deleteMeeting(req, res, next) {
  try {
    const deleted = await Meeting.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deleted) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    
    await TranscriptSegment.deleteMany({ meetingId: req.params.id });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
