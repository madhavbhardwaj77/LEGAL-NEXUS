const mongoose = require('mongoose');

const documentAnalysisSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      unique: true,
      index: true,
    },
    summary: {
      type: String,
    },
    extractedEntities: {
      parties: [String],
      dates: [Date],
      monetaryAmounts: [
        {
          amount: Number,
          currency: String,
          context: String,
        }
      ],
      jurisdictions: [String],
      clausesIdentified: [String],
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    keyRisks: [
      {
        clause: String,
        riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
        explanation: String,
      }
    ],
    ocrTextSnippet: {
      type: String,
    },
    rawAiOutput: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const DocumentAnalysis = mongoose.model('DocumentAnalysis', documentAnalysisSchema);
module.exports = DocumentAnalysis;
