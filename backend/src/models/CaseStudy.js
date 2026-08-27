const mongoose = require('mongoose');

const caseStudySchema = new mongoose.Schema(
  {
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Case study title is required'],
      trim: true,
    },
    practiceArea: {
      type: String,
      required: true,
      index: true,
    },
    forum: {
      type: String, // e.g. "National Consumer Disputes Redressal Commission", "High Court"
      trim: true,
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
    },
    challenge: {
      type: String,
    },
    strategy: {
      type: String,
    },
    outcome: {
      type: String,
      required: [true, 'Outcome description is required'],
    },
    anonymizedDetails: {
      type: Boolean,
      default: true,
    },
    year: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const CaseStudy = mongoose.model('CaseStudy', caseStudySchema);
module.exports = CaseStudy;
