const express = require('express');
const {
  requestConsultation,
  getIncomingRequests,
  respondToRequest,
  getCitizenRequests,
} = require('../controllers/lawyerController');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

// POST /api/requests (Citizen requests legal assistance)
router.post('/', authenticateJWT, requestConsultation);

// GET /api/requests (Incoming requests for lawyer)
router.get('/', authenticateJWT, getIncomingRequests);

// GET /api/requests/citizen (Requests sent by citizen)
router.get('/citizen', authenticateJWT, getCitizenRequests);

// PATCH /api/requests/:requestId/accept (Lawyer accepts)
router.patch('/:requestId/accept', authenticateJWT, respondToRequest);

// PATCH /api/requests/:requestId/reject (Lawyer rejects)
router.patch('/:requestId/reject', authenticateJWT, respondToRequest);

// PATCH /api/requests/:requestId/respond (Generic respond)
router.patch('/:requestId/respond', authenticateJWT, respondToRequest);

module.exports = router;
