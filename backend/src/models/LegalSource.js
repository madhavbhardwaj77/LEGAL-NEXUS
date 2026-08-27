const mongoose = require('mongoose');

const legalSourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Legal source title is required'],
      trim: true,
      index: true,
    },
    citation: {
      type: String,
      trim: true,
      index: true,
    },
    sourceType: {
      type: String,
      enum: ['STATUTE', 'CASE_LAW', 'REGULATION', 'CONSTITUTION', 'RULES_AND_ORDER', 'CIRCULAR'],
      default: 'STATUTE',
      index: true,
    },
    court: {
      type: String, // e.g. "Supreme Court of India", "Delhi High Court"
      trim: true,
    },
    jurisdiction: {
      type: String,
      default: 'India',
      trim: true,
    },
    year: {
      type: Number,
      index: true,
    },
    sourceUrl: {
      type: String,
    },
    actNumber: {
      type: String,
    },
    shortSummary: {
      type: String,
    },
    fullTextUrl: {
      type: String,
    },
    totalChunks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

legalSourceSchema.index({ title: 'text', citation: 'text', court: 'text', shortSummary: 'text' });

const LegalSource = mongoose.model('LegalSource', legalSourceSchema);
module.exports = LegalSource;
