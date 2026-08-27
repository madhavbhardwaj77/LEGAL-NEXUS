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
      enum: ['SUGGESTED', 'SENT_TO_LAWYER', 'ACCEPTED', 'DECLINED', 'EXPIRED'],
      default: 'SUGGESTED',
      index: true,
    },
    citizenViewed: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

lawyerMatchSchema.index({ case: 1, lawyer: 1 }, { unique: true });

const LawyerMatch = mongoose.model('LawyerMatch', lawyerMatchSchema);
module.exports = LawyerMatch;
