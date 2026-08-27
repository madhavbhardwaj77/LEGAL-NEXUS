const mongoose = require('mongoose');

const legalChunkSchema = new mongoose.Schema(
  {
    legalSource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LegalSource',
      required: true,
      index: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    sectionNumber: {
      type: String,
      trim: true,
    },
    sectionTitle: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    tokenCount: {
      type: Number,
    },
    keywords: [{ type: String, trim: true }],
    vectorId: {
      type: String, // Vector DB index reference (Qdrant / Milvus / Pinecone / Chroma)
      index: true,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

legalChunkSchema.index({ legalSource: 1, chunkIndex: 1 });
legalChunkSchema.index({ content: 'text', sectionTitle: 'text', keywords: 'text' });

const LegalChunk = mongoose.model('LegalChunk', legalChunkSchema);
module.exports = LegalChunk;
