const mongoose = require('mongoose');

const researchNoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      default: '',
    },
    folder: {
      type: String,
      default: 'General Research',
      trim: true,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    clippedSources: [
      {
        actName: { type: String, trim: true },
        section: { type: String, trim: true },
        title: { type: String, trim: true },
        content: { type: String },
        citation: { type: String },
        clippedAt: { type: Date, default: Date.now },
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#0B1F33',
    },
  },
  {
    timestamps: true,
  }
);

researchNoteSchema.index({ user: 1, folder: 1 });
researchNoteSchema.index({ user: 1, tags: 1 });

const ResearchNote = mongoose.model('ResearchNote', researchNoteSchema);
module.exports = ResearchNote;
