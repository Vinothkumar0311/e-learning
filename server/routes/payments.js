const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { 
  getPayments, 
  getPaymentLedger, 
  getPayment, 
  verifyPayment, 
  manualUpdatePayment, 
  createManualPayment, 
  getPaymentAuditLogs, 
  exportPaymentsCSV, 
  uploadPaymentProof 
} = require('../controllers/paymentController');

const { protect, authorize, studentProtect } = require('../middleware/auth');

// Setup multer storage for proof uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `proof-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, PNG, or WebP screenshot files are allowed!'));
  }
});

// Admin-only routing
router.get('/', protect, authorize('admin', 'super_admin'), getPayments);
router.get('/ledger', protect, authorize('admin', 'super_admin'), getPaymentLedger);
router.get('/export', protect, authorize('admin', 'super_admin'), exportPaymentsCSV);
router.post('/manual', protect, authorize('admin', 'super_admin'), createManualPayment);

router.get('/:id', protect, authorize('admin', 'super_admin'), getPayment);
router.patch('/:id/verify', protect, authorize('admin', 'super_admin'), verifyPayment);
router.patch('/:id/manual-update', protect, authorize('admin', 'super_admin'), manualUpdatePayment);
router.get('/:id/audit', protect, authorize('admin', 'super_admin'), getPaymentAuditLogs);

// Student action: Upload proof screenshot
router.post('/:id/proof', studentProtect, upload.single('proof'), uploadPaymentProof);

module.exports = router;
