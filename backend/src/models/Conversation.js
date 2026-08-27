const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'Legal Intake Conversation',
    },
    conversationType: {
      type: String,
      enum: ['CASE_INTAKE', 'LAWYER_CONSULTATION', 'AI_ASSISTANT', 'GENERAL_SUPPORT'],
      default: 'CASE_INTAKE',
      index: true,
    },
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String },
        joinedAt: { type: Date, default: Date.now },
      }
    ],
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'],
      default: 'ACTIVE',
    },
    extractedSummary: {
      type: String,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

conversationSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'conversation',
  options: { sort: { createdAt: 1 } },
});

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
