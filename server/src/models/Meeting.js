



import mongoose from 'mongoose'

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    
    status: {
      type: String,
      enum: ['recording', 'completed', 'summarized'],
      default: 'recording',
    },

    
    
    summary: {
      overview: { type: String, default: '' },
      keyPoints: { type: [String], default: [] },
      actionItems: { type: [String], default: [] },
      decisions: { type: [String], default: [] },
    },

    
    tasks: [{
      description: { type: String, required: true },
      assignee: { type: String, default: '' },
      completed: { type: Boolean, default: false }
    }],

    durationSeconds: { type: Number, default: 0 },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    recipients: { type: [String], default: [] },
  },
  { timestamps: true }
)

export const Meeting = mongoose.model('Meeting', meetingSchema)
