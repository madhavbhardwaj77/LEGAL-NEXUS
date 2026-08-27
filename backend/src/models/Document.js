const mongoose = require('mongoose');
const { DOCUMENT_PROCESSING_STATUSES } = require('../utils/constants');

const documentSchema = new mongoose.Schema(
  {
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    documentType: {
      type: String,
      enum: [
        'LEGAL_NOTICE',
        'EMPLOYMENT_CONTRACT',
        'SALARY_SLIP',
        'BANK_STATEMENT',
        'RENT_AGREEMENT',
        'SALE_DEED',
        'PETITION',
        'AFFIDAVIT',
        'COURT_ORDER',
        'IDENTITY_PROOF',
        'OTHER'
      ],
      default: 'OTHER',
      index: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL or storage path is required'],
    },
    fileName: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number, // in bytes
    },
    mimeType: {
      type: String,
      trim: true,
    },
    pageCount: {
      type: Number,
      default: 1,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    processingStatus: {
      type: String,
      enum: DOCUMENT_PROCESSING_STATUSES,
      default: 'PENDING',
      index: true,
    },
    processingJobId: {
      type: String,
    },
    analysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DocumentAnalysis',
    },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ case: 1, createdAt: -1 });

const Document = mongoose.model('Document', documentSchema);
module.exports = Document;
