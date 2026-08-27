const mongoose = require('mongoose');
const { TIMELINE_EVENT_TYPES, TIMELINE_SOURCES } = require('../utils/constants');

const caseTimelineSchema = new mongoose.Schema(
  {
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: TIMELINE_EVENT_TYPES,
      default: 'CUSTOM_EVENT',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    dateTime: {
      type: Date,
      required: [true, 'Event date and time is required'],
      default: Date.now,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    source: {
      type: String,
      enum: TIMELINE_SOURCES,
      default: 'USER',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
      }
    ],
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast chronological sorting by case
caseTimelineSchema.index({ case: 1, dateTime: 1 });

const CaseTimeline = mongoose.model('CaseTimeline', caseTimelineSchema);
module.exports = CaseTimeline;
