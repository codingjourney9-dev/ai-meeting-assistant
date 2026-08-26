

import mongoose from 'mongoose';

const transcriptSegmentSchema = new mongoose.Schema(
  {
    
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
      index: true, 
    },

    
    text: { type: String, required: true },

    
    isFinal: { type: Boolean, default: true },

    
    timestamp: { type: Number, required: true },

    
  },
  { timestamps: true }
);

export const TranscriptSegment = mongoose.model(
  'TranscriptSegment',
  transcriptSegmentSchema
);
