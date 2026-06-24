const express = require('express');
const router = express.Router();
const { getAllStudentsPerformance } = require('../controllers/progressController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', authorize('admin', 'super_admin'), getAllStudentsPerformance);

module.exports = router;
