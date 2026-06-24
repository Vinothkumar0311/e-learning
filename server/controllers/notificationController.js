const { Notification, User } = require('../models');
const { success, error } = require('../utils/response');

// @desc    Get all sent/scheduled notifications
// @route   GET /api/notifications
// @access  Private (Admin)
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    return success(res, 'Notifications retrieved successfully', notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return error(res, 'Failed to fetch notifications', 500);
  }
};

// @desc    Create and send a new notification
// @route   POST /api/notifications
// @access  Private (Admin)
exports.createNotification = async (req, res) => {
  try {
    const { type, title, message, recipient_group, status } = req.body;

    if (!type || !title || !message) {
      return error(res, 'Please provide notification type, title, and message', 400);
    }

    const newNotification = await Notification.create({
      type,
      title,
      message,
      recipient_group: recipient_group || 'All Registered Students',
      status: status || 'sent',
      sent_by: req.user.id
    });

    const populatedNotification = await Notification.findByPk(newNotification.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    return success(res, 'Notification sent/created successfully', populatedNotification, 201);
  } catch (err) {
    console.error('Error creating notification:', err);
    return error(res, 'Failed to send notification', 500);
  }
};
