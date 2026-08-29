const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');
const { ROLES } = require('../config/roles');
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getFolders,
  exportBrief,
} = require('../controllers/notebookController');

router.use(authenticateJWT, authorizeRoles(ROLES.LAWYER, ROLES.ADMIN, ROLES.LAW_STUDENT));

router.get('/', getNotes);
router.post('/', createNote);
router.get('/folders', getFolders);
router.post('/export', exportBrief);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
