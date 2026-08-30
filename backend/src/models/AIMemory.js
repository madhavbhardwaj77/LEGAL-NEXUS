const mongoose = require('mongoose');

const aiMemorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['LEGAL_PREFERENCE', 'DISPUTE_HISTORY', 'USER_FACT', 'ACTIVE_CONTEXT', 'STATUTE_INTEREST'],
      default: 'ACTIVE_CONTEXT',
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    confidence: {
      type: Number,
      default: 0.9,
      min: 0,
      max: 1,
    },
    source: {
      type: String,
      default: 'CONVERSATION_INTAKE',
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

aiMemorySchema.index({ user: 1, key: 1 }, { unique: true });

const AIMemory = mongoose.model('AIMemory', aiMemorySchema);
module.exports = AIMemory;
