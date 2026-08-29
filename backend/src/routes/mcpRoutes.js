const express = require('express');
const router = express.Router();
const { listTools, executeTool } = require('../controllers/mcpController');

router.get('/tools', listTools);
router.post('/call', executeTool);

module.exports = router;
