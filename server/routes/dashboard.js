const express = require('express');
const router = express.Router();
const { getStats, getRecentEnrollments, getUpcomingClasses } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getStats);
router.get('/recent-enrollments', getRecentEnrollments);
router.get('/upcoming-classes', getUpcomingClasses);

module.exports = router;
