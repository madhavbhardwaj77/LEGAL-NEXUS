const { Document, DocumentAnalysis, Case } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { enqueueJob, QUEUES } = require('../services/queueService');

/**
 * POST /api/documents
 * Register document metadata & push background processing job
 */
const uploadDocumentMetadata = async (req, res, next) => {
  try {
    const { caseId, title, documentType, fileUrl, fileName, fileSize, mimeType, pageCount, tags } = req.body;

    if (caseId) {
      const caseExists = await Case.findById(caseId);
      if (!caseExists) {
        return sendError(res, 'Associated case not found', 404);
      }
    }

    const doc = await Document.create({
      case: caseId || undefined,
      title,
      documentType: documentType || 'OTHER',
      fileUrl,
      fileName: fileName || title,
      fileSize: fileSize || 0,
      mimeType: mimeType || 'application/pdf',
      pageCount: pageCount || 1,
      uploadedBy: req.user._id,
      processingStatus: 'PENDING',
      tags,
    });

    // Enqueue document processing job in Redis Queue
    const job = await enqueueJob(QUEUES.DOCUMENT_PROCESSING, {
      documentId: doc._id,
      caseId: doc.case,
      fileUrl: doc.fileUrl,
      documentType: doc.documentType,
      uploadedBy: req.user._id,
    });

    doc.processingJobId = job.jobId;
    doc.processingStatus = 'QUEUED';
    await doc.save();

    return sendSuccess(
      res,
      {
        document: doc,
        queueJob: job,
      },
      'Document metadata registered and enqueued for processing',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/documents/case/:caseId
 */
const getCaseDocuments = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const documents = await Document.find({ case: caseId })
      .populate('uploadedBy', 'email role')
      .populate('analysis')
      .sort({ createdAt: -1 });

    return sendSuccess(res, documents, 'Documents retrieved for case');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/documents/:id
 */
const getDocumentById = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id)
      .populate('uploadedBy', 'email role')
      .populate('analysis');

    if (!doc) {
      return sendError(res, 'Document not found', 404);
    }

    return sendSuccess(res, doc, 'Document details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/documents/:id/process
 * Manually trigger / re-trigger document analysis job
 */
const triggerDocumentProcessing = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return sendError(res, 'Document not found', 404);
    }

    const job = await enqueueJob(QUEUES.DOCUMENT_PROCESSING, {
      documentId: doc._id,
      caseId: doc.case,
      fileUrl: doc.fileUrl,
      documentType: doc.documentType,
      uploadedBy: req.user._id,
    });

    doc.processingJobId = job.jobId;
    doc.processingStatus = 'QUEUED';
    await doc.save();

    return sendSuccess(res, { document: doc, queueJob: job }, 'Document re-queued for processing');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocumentMetadata,
  getCaseDocuments,
  getDocumentById,
  triggerDocumentProcessing,
};
