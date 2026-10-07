const Notification = require('../models/Notification');

class NotificationService {
  async getNotifications(userId) {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return {
      notifications,
      unreadCount
    };
  }

  async markAsRead(id, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );
    return notification;
  }

  async markAllAsRead(userId) {
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    return { success: true };
  }

  async clearAll(userId) {
    await Notification.deleteMany({ userId });
    return { success: true };
  }
}

module.exports = new NotificationService();
