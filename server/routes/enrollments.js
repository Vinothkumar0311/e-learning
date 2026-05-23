const express = require('express');
const router = express.Router();
const { getEnrollments, getEnrollment, updateStatus, approveEnrollment, rejectEnrollment } = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getEnrollments);
router.route('/:id').get(getEnrollment);
router.patch('/:id/status', authorize('admin', 'super_admin'), updateStatus);
router.post('/:id/approve', authorize('admin', 'super_admin'), approveEnrollment);
router.post('/:id/reject', authorize('admin', 'super_admin'), rejectEnrollment);

module.exports = router;
