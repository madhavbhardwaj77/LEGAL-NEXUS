const mongoose = require('mongoose');
const { DRAFT_STATUSES } = require('../utils/constants');

const draftSchema = new mongoose.Schema(
  {
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Draft title is required'],
      trim: true,
    },
    draftType: {
      type: String,
      enum: [
        'STATUTORY_LEGAL_NOTICE',
        'CONSUMER_FORUM_COMPLAINT',
        'EMPLOYER_WAGE_GRIEVANCE',
        'LANDLORD_SECURITY_DEPOSIT_NOTICE',
        'POLICE_CYBER_CRIME_COMPLAINT',
        'RTI_APPLICATION',
        'LEGAL_INFORMATION_SUMMARY',
        'LEGAL_NOTICE_EMPLOYMENT',
        'LEGAL_NOTICE_CHEQUE_BOUNCE',
        'LEGAL_NOTICE_CONSUMER',
        'LEGAL_NOTICE_PROPERTY',
        'WRITTEN_STATEMENT',
        'CONSUMER_COMPLAINT',
        'BAIL_APPLICATION',
        'AFFIDAVIT',
        'GENERAL_LEGAL_NOTICE',
        'CUSTOM_DRAFT',
      ],
      default: 'STATUTORY_LEGAL_NOTICE',
      required: true,
    },
    templateId: {
      type: String,
    },
    version: {
      type: Number,
      default: 1,
    },
    contentMarkdown: {
      type: String,
      required: [true, 'Draft content is required'],
    },
    generatedBy: {
      type: String,
      enum: ['USER', 'LAWYER', 'AI', 'AI_ENGINE'],
      default: 'USER',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: DRAFT_STATUSES,
      default: 'DRAFT',
      index: true,
    },
    variables: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

draftSchema.index({ case: 1, createdAt: -1 });

const Draft = mongoose.model('Draft', draftSchema);
module.exports = Draft;
