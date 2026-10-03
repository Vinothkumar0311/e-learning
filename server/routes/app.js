const express = require('express');
const router = express.Router();
const { getAppVersion, updateAppVersion } = require('../controllers/appController');
const { protect, authorize } = require('../middleware/auth');

router.get('/version', getAppVersion);
router.put('/version', protect, authorize('admin', 'super_admin'), updateAppVersion);

module.exports = router;
