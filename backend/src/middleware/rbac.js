const { ROLES } = require('../config/roles');
const { Case } = require('../models');
const { sendError } = require('../utils/apiResponse');

/**
 * Authorize specific roles to access a route
 * @param  {...string} allowedRoles
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== ROLES.ADMIN) {
      return sendError(
        res,
        `Access denied. Role "${req.user.role}" is not authorized for this resource.`,
        403
      );
    }

    next();
  };
};

/**
 * Verify that the user has permission to access or modify a specific case
 * (Must be owner, assigned lawyer/student, lawyer accepting open case, or admin)
 */
const requireCaseAccess = async (req, res, next) => {
  try {
    const caseId = req.params.id || req.params.caseId || req.body.caseId;
    if (!caseId) {
      return sendError(res, 'Case ID is required.', 400);
    }

    const foundCase = await Case.findById(caseId);
    if (!foundCase) {
      return sendError(res, 'Case not found.', 404);
    }

    const userIdStr = req.user._id.toString();
    const isOwner = foundCase.user && foundCase.user.toString() === userIdStr;
    const isAssignedLawyer = foundCase.assignedLawyer && foundCase.assignedLawyer.toString() === userIdStr;
    const isAssignedStudent = foundCase.assignedLawStudent && foundCase.assignedLawStudent.toString() === userIdStr;
    const isAdmin = req.user.role === ROLES.ADMIN;
    // Allow verified lawyers to view or take on unassigned open cases
    const isLawyerViewingOpenCase =
      (req.user.role === ROLES.LAWYER || req.user.role === ROLES.LAW_STUDENT) &&
      (foundCase.status === 'OPEN' || !foundCase.assignedLawyer);

    if (!isOwner && !isAssignedLawyer && !isAssignedStudent && !isAdmin && !isLawyerViewingOpenCase) {
      return sendError(res, 'You do not have permission to access or modify this case.', 403);
    }

    req.case = foundCase;
    next();
  } catch (error) {
    return sendError(res, `Failed to verify case access: ${error.message}`, 500);
  }
};

module.exports = {
  authorizeRoles,
  requireCaseAccess,
};
