const express = require('express');
const router = express.Router();
const { 
  getEnrollments, 
  getEnrollment, 
  updateStatus, 
  approveEnrollment, 
  rejectEnrollment,
  getPendingEnrollments,
  verifyStudent,
  setAmount,
  recordPayment,
  toggleBlock,
  requestPayment
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getEnrollments);
router.route('/pending').get(getPendingEnrollments);
router.route('/:id').get(getEnrollment);
router.patch('/:id/status', authorize('admin', 'super_admin'), updateStatus);
router.patch('/:id/verify-student', authorize('admin', 'super_admin'), verifyStudent);
router.patch('/:id/set-amount', authorize('admin', 'super_admin'), setAmount);
router.post('/:id/approve', authorize('admin', 'super_admin'), approveEnrollment);
router.patch('/:id/approve', authorize('admin', 'super_admin'), approveEnrollment);
router.post('/:id/reject', authorize('admin', 'super_admin'), rejectEnrollment);
router.post('/:id/record-payment', authorize('admin', 'super_admin'), recordPayment);
router.patch('/:id/block', authorize('admin', 'super_admin'), toggleBlock);
router.post('/:id/request-payment', authorize('admin', 'super_admin'), requestPayment);

module.exports = router;

