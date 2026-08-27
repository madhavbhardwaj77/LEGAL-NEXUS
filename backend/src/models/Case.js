const mongoose = require('mongoose');
const { CASE_CATEGORIES, CASE_STATUSES, URGENCY_LEVELS } = require('../utils/constants');

const caseSchema = new mongoose.Schema(
  {
    caseNumber: {
      type: String,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedLawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    assignedLawStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Case title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: CASE_CATEGORIES,
      required: [true, 'Case category is required'],
      index: true,
    },
    issue: {
      type: String,
      required: [true, 'Legal issue summary is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Detailed case description is required'],
      trim: true,
    },
    parties: {
      plaintiff: {
        name: { type: String, trim: true },
        relationship: { type: String, trim: true },
        contact: { type: String, trim: true },
      },
      defendant: {
        name: { type: String, trim: true },
        organization: { type: String, trim: true },
        designation: { type: String, trim: true },
        contact: { type: String, trim: true },
      },
      otherParties: [
        {
          name: String,
          role: String,
          details: String,
        }
      ],
    },
    location: {
      city: { type: String, trim: true, index: true },
      state: { type: String, trim: true, index: true },
      jurisdictionCourt: { type: String, trim: true },
    },
    urgency: {
      type: String,
      enum: URGENCY_LEVELS,
      default: 'MEDIUM',
      index: true,
    },
    status: {
      type: String,
      enum: CASE_STATUSES,
      default: 'OPEN',
      index: true,
    },
    legalQuestions: [
      {
        question: { type: String, trim: true },
        category: { type: String, trim: true },
        answered: { type: Boolean, default: false },
      }
    ],
    recommendedActions: [
      {
        action: { type: String, trim: true },
        priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
        completed: { type: Boolean, default: false },
        targetDate: { type: Date },
      }
    ],
    relevantSources: [
      {
        sourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'LegalSource' },
        title: { type: String },
        citation: { type: String },
        snippet: { type: String },
        relevanceScore: { type: Number },
      }
    ],
    financialDetails: {
      disputedAmount: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      isProBonoRequested: { type: Boolean, default: false },
    },
    intakeConversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    tags: [{ type: String, trim: true }],
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

// Virtual to populate timeline events
caseSchema.virtual('timelineEvents', {
  ref: 'CaseTimeline',
  localField: '_id',
  foreignField: 'case',
  options: { sort: { dateTime: 1 } },
});

// Virtual to populate case evidence
caseSchema.virtual('evidenceList', {
  ref: 'CaseEvidence',
  localField: '_id',
  foreignField: 'case',
});

// Virtual to populate case documents
caseSchema.virtual('documentsList', {
  ref: 'Document',
  localField: '_id',
  foreignField: 'case',
});

// Auto-generate human-readable case number before save
caseSchema.pre('validate', function (next) {
  if (!this.caseNumber) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    this.caseNumber = `NYA-${dateStr}-${randomSuffix}`;
  }
  next();
});

// Text index for search
caseSchema.index({
  title: 'text',
  issue: 'text',
  description: 'text',
  'location.city': 'text',
  'location.state': 'text',
  category: 'text'
});

const Case = mongoose.model('Case', caseSchema);
module.exports = Case;
