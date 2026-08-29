const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getFolders,
  exportBrief,
} = require('../controllers/notebookController');

router.use(authenticateJWT);

router.get('/', getNotes);
router.post('/', createNote);
router.get('/folders', getFolders);
router.post('/export', exportBrief);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
