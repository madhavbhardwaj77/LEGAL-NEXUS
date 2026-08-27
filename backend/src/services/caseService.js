const { Case, CaseTimeline, Notification } = require('../models');
const { getCache, setCache, deleteCache, invalidatePattern } = require('./redisService');
const logger = require('../utils/logger');

/**
 * Create a new case and initialize its primary timeline event
 */
const createCase = async (caseData, userId) => {
  const newCase = await Case.create({
    ...caseData,
    user: userId,
  });

  // Create initial timeline event: Case Intake Filed
  await CaseTimeline.create({
    case: newCase._id,
    eventType: 'COMPLAINT_FILED',
    title: 'Case Filed on Nyaya Setu',
    description: `Case intake registered under category "${newCase.category}" with issue: ${newCase.issue}`,
    source: 'USER',
    createdBy: userId,
    dateTime: newCase.createdAt || new Date(),
  });

  // Invalidate any cached case lists
  await invalidatePattern('cases:list:*');

  return newCase;
};

/**
 * Get case by ID with Redis caching
 */
const getCaseById = async (caseId) => {
  const cacheKey = `cases:detail:${caseId}`;
  const cachedCase = await getCache(cacheKey);
  if (cachedCase) {
    return cachedCase;
  }

  const foundCase = await Case.findById(caseId)
    .populate('user', 'email role phone')
    .populate('assignedLawyer', 'email role phone')
    .populate('assignedLawStudent', 'email role phone')
    .populate('timelineEvents')
    .populate('evidenceList')
    .populate('documentsList');

  if (foundCase) {
    // Cache for 10 minutes
    await setCache(cacheKey, foundCase, 600);
  }

  return foundCase;
};

/**
 * Update case and invalidate cache
 */
const updateCase = async (caseId, updateData, updatedByUserId) => {
  const existingCase = await Case.findById(caseId);
  if (!existingCase) {
    const error = new Error('Case not found.');
    error.statusCode = 404;
    throw error;
  }

  // Detect status change to add timeline event
  const previousStatus = existingCase.status;
  Object.assign(existingCase, updateData);
  const updatedCase = await existingCase.save();

  if (updateData.status && updateData.status !== previousStatus) {
    await CaseTimeline.create({
      case: updatedCase._id,
      eventType: 'CUSTOM_EVENT',
      title: `Case Status Changed to ${updatedCase.status}`,
      description: `Status was updated from ${previousStatus} to ${updatedCase.status}`,
      source: 'SYSTEM',
      createdBy: updatedByUserId,
      dateTime: new Date(),
    });
  }

  // Invalidate cache
  await deleteCache(`cases:detail:${caseId}`);
  await invalidatePattern('cases:list:*');

  return updatedCase;
};

/**
 * List cases with filtering and pagination
 */
const listCases = async ({ filter = {}, page = 1, limit = 20, sort = { createdAt: -1 } }) => {
  const skip = (page - 1) * limit;
  const [cases, total] = await Promise.all([
    Case.find(filter)
      .populate('user', 'email role')
      .populate('assignedLawyer', 'email role')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Case.countDocuments(filter),
  ]);

  return {
    cases,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  createCase,
  getCaseById,
  updateCase,
  listCases,
};
