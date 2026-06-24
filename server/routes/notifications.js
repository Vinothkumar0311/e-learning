const express = require('express');
const router = express.Router();
const { getNotifications, createNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getNotifications)
  .post(protect, createNotification);

module.exports = router;
