const notificationService = require('../services/notificationService');
const { successResponse } = require('../utils/apiResponse');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const data = await notificationService.getNotifications(req.user._id);
      return successResponse(res, 'Notifications retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const data = await notificationService.markAsRead(req.params.id, req.user._id);
      return successResponse(res, 'Notification marked as read', data);
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user._id);
      return successResponse(res, 'All notifications marked as read', null);
    } catch (err) {
      next(err);
    }
  }

  async clearAll(req, res, next) {
    try {
      await notificationService.clearAll(req.user._id);
      return successResponse(res, 'All notifications cleared', null);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
