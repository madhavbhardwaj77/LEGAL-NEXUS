const mongoose = require('mongoose');
const { EVIDENCE_TYPES } = require('../utils/constants');

const caseEvidenceSchema = new mongoose.Schema(
  {
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Evidence title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    evidenceType: {
      type: String,
      enum: EVIDENCE_TYPES,
      default: 'DOCUMENT',
      required: true,
      index: true,
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
    },
    mimeType: {
      type: String,
      trim: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    verifiedByLawyer: {
      type: Boolean,
      default: false,
    },
    dateOfOccurrence: {
      type: Date,
    },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

caseEvidenceSchema.index({ case: 1, createdAt: -1 });

const CaseEvidence = mongoose.model('CaseEvidence', caseEvidenceSchema);
module.exports = CaseEvidence;
