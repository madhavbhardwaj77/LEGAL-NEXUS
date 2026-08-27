const express = require('express');
const { searchLawyersDirectory, getLawyerDetails } = require('../controllers/lawyerController');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

// Allow authenticated users to search directory
router.get('/', authenticateJWT, searchLawyersDirectory);
router.get('/:id', authenticateJWT, getLawyerDetails);

module.exports = router;
