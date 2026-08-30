const mongoose = require('mongoose');

const lawyerMatchSchema = new mongoose.Schema(
  {
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
      index: true,
    },
    lawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    matchReasons: [
      {
        criterion: String, // e.g. "Practice Area Match", "City / Court Jurisdiction", "Experience Level", "Fee Compatibility"
        score: Number,
        details: String,
      }
    ],
    status: {
      type: String,
      enum: ['SUGGESTED', 'PENDING', 'SENT_TO_LAWYER', 'ACCEPTED', 'REJECTED', 'DECLINED', 'EXPIRED'],
      default: 'PENDING',
      index: true,
    },
    citizenViewed: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
    },
    requestMessage: {
      type: String,
      trim: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

lawyerMatchSchema.index({ case: 1, lawyer: 1 }, { unique: true });

const LawyerMatch = mongoose.model('LawyerMatch', lawyerMatchSchema);
module.exports = LawyerMatch;
