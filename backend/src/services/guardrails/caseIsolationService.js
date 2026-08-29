/**
 * Case Isolation & Tenant Authorization Service
 * Enforces strict resource-level isolation so users can never access unauthorized cases
 */

const { Case } = require('../../models');

class CaseIsolationService {
  /**
   * Generates a MongoDB query filter scoped to the authenticated user's permissions
   */
  static getScopedCaseQuery(user) {
    if (!user) return { _id: null }; // Deny all
    if (user.role === 'ADMIN') return {}; // Admin can see all

    const userId = user._id;

    if (user.role === 'LAWYER') {
      return {
        $or: [
          { user: userId },
          { assignedLawyer: userId },
          { status: 'OPEN' }, // Available for intake
        ],
      };
    }

    if (user.role === 'LAW_STUDENT') {
      return {
        $or: [
          { user: userId },
          { assignedLawStudent: userId },
          { status: 'OPEN' },
        ],
      };
    }

    // Citizens only see their own cases
    return { user: userId };
  }

  /**
   * Verifies if a user has permission to read a specific case object
   */
  static isUserAuthorizedForCase(user, caseDoc) {
    if (!user || !caseDoc) return false;
    if (user.role === 'ADMIN') return true;

    const userIdStr = user._id.toString();
    const isOwner = caseDoc.user && caseDoc.user.toString() === userIdStr;
    const isAssignedLawyer = caseDoc.assignedLawyer && caseDoc.assignedLawyer.toString() === userIdStr;
    const isAssignedStudent = caseDoc.assignedLawStudent && caseDoc.assignedLawStudent.toString() === userIdStr;
    const isLawyerViewingOpen =
      (user.role === 'LAWYER' || user.role === 'LAW_STUDENT') &&
      (caseDoc.status === 'OPEN' || !caseDoc.assignedLawyer);

    return isOwner || isAssignedLawyer || isAssignedStudent || isLawyerViewingOpen;
  }
}

module.exports = CaseIsolationService;
