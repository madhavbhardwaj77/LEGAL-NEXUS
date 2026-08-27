const mongoose = require('mongoose');
const { VERIFICATION_STATUSES } = require('../utils/constants');

const verificationRequestSchema = new mongoose.Schema(
  {
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requestedRole: {
      type: String,
      enum: ['LAWYER', 'LAW_STUDENT', 'LEGAL_ORGANIZATION'],
      required: true,
    },
    submittedData: {
      fullName: String,
      barRegistrationNumber: String,
      stateBarCouncil: String,
      enrollmentYear: Number,
      institutionName: String,
      degree: String,
      idCardUrl: String,
      certificateUrl: String,
      additionalNotes: String,
    },
    status: {
      type: String,
      enum: VERIFICATION_STATUSES,
      default: 'PENDING',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    reviewNotes: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const VerificationRequest = mongoose.model('VerificationRequest', verificationRequestSchema);
module.exports = VerificationRequest;
