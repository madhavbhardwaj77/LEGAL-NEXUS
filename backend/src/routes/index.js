const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const profileRoutes = require('./profileRoutes');
const caseRoutes = require('./caseRoutes');
const documentRoutes = require('./documentRoutes');
const legalRoutes = require('./legalRoutes');
const aiRoutes = require('./aiRoutes');
const lawyerRoutes = require('./lawyerRoutes');
const draftRoutes = require('./draftRoutes');
const verificationRoutes = require('./verificationRoutes');
const notificationRoutes = require('./notificationRoutes');
const adminRoutes = require('./adminRoutes');
const healthRoutes = require('./healthRoutes');
const requestRoutes = require('./requestRoutes');

const router = express.Router();

// Mount all route groups
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profiles', profileRoutes);
router.use('/cases', caseRoutes);
router.use('/documents', documentRoutes);
router.use('/legal', legalRoutes);
router.use('/ai', aiRoutes);
router.use('/lawyers', lawyerRoutes);
router.use('/requests', requestRoutes);
router.use('/drafts', draftRoutes);
router.use('/verification', verificationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/health', healthRoutes);

module.exports = router;
