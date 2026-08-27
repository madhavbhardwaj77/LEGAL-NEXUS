const { LegalSource, LegalChunk } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * POST /api/legal/sources
 */
const createLegalSource = async (req, res, next) => {
  try {
    const { title, citation, sourceType, court, jurisdiction, year, sourceUrl, actNumber, shortSummary, fullTextUrl } = req.body;
    const source = await LegalSource.create({
      title,
      citation,
      sourceType,
      court,
      jurisdiction,
      year,
      sourceUrl,
      actNumber,
      shortSummary,
      fullTextUrl,
    });

    return sendSuccess(res, source, 'Legal source indexed successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/legal/sources
 */
const listLegalSources = async (req, res, next) => {
  try {
    const { sourceType, court, year, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (sourceType) filter.sourceType = sourceType;
    if (court) filter.court = new RegExp(court, 'i');
    if (year) filter.year = parseInt(year, 10);
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const [sources, total] = await Promise.all([
      LegalSource.find(filter).sort({ year: -1, createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
      LegalSource.countDocuments(filter),
    ]);

    return sendSuccess(res, sources, 'Legal sources retrieved', 200, {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/legal/sources/:id
 */
const getLegalSourceById = async (req, res, next) => {
  try {
    const source = await LegalSource.findById(req.params.id);
    if (!source) {
      return sendError(res, 'Legal source not found', 404);
    }
    const chunks = await LegalChunk.find({ legalSource: source._id }).sort({ chunkIndex: 1 });
    return sendSuccess(res, { source, chunks }, 'Legal source details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/legal/sources/:id/chunks
 */
const addLegalChunk = async (req, res, next) => {
  try {
    const sourceId = req.params.id;
    const source = await LegalSource.findById(sourceId);
    if (!source) {
      return sendError(res, 'Legal source not found', 404);
    }

    const { chunkIndex, sectionNumber, sectionTitle, content, tokenCount, keywords, vectorId, metadata } = req.body;
    const chunk = await LegalChunk.create({
      legalSource: sourceId,
      chunkIndex: chunkIndex !== undefined ? chunkIndex : source.totalChunks,
      sectionNumber,
      sectionTitle,
      content,
      tokenCount,
      keywords,
      vectorId,
      metadata,
    });

    source.totalChunks += 1;
    await source.save();

    return sendSuccess(res, chunk, 'Legal chunk added successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/legal/search
 */
const searchLegalCorpus = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q) {
      return sendError(res, 'Search query "q" is required', 400);
    }

    const chunks = await LegalChunk.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit, 10))
      .populate('legalSource', 'title citation court year sourceType');

    return sendSuccess(res, chunks, `Found ${chunks.length} legal references`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLegalSource,
  listLegalSources,
  getLegalSourceById,
  addLegalChunk,
  searchLegalCorpus,
};
