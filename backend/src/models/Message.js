const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    senderRole: {
      type: String,
      enum: ['CITIZEN', 'LAWYER', 'LAW_STUDENT', 'LEGAL_ORGANIZATION', 'ADMIN', 'AI_AGENT', 'SYSTEM'],
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
    },
    messageType: {
      type: String,
      enum: ['TEXT', 'STRUCTURED_INTAKE', 'FILE_ATTACHMENT', 'FORM_SUBMISSION', 'SYSTEM_ALERT'],
      default: 'TEXT',
    },
    extractedEntities: {
      dates: [Date],
      amounts: [String],
      parties: [String],
      locations: [String],
    },
    isReadBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now },
      }
    ],
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
