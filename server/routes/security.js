const express = require('express');
const router = express.Router();
const {
  getActiveSessions,
  forceLogoutSession,
  getAuditLogs,
  reactivateStudent,
  logClientSecurityEvent
} = require('../controllers/securityController');
const { protect, authorize, studentProtect } = require('../middleware/auth');

// Client security event logging (Student protected)
router.post('/log', studentProtect, logClientSecurityEvent);

// Admin-only security management routes
router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.get('/sessions', getActiveSessions);
router.delete('/sessions/:id', forceLogoutSession);
router.get('/audit-logs', getAuditLogs);
router.post('/students/:id/reactivate', reactivateStudent);

module.exports = router;
