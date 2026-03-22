const Notification = require('../models/Notification');

const notificationController = {
  getAll: async (req, res) => {
    try {
      const notifications = await Notification.getByUser(req.user.id, req.workspaceId, {
        limit: parseInt(req.query.limit) || 20,
        unreadOnly: req.query.unread === 'true'
      });
      const unreadCount = await Notification.getUnreadCount(req.user.id, req.workspaceId);
      res.json({ notifications, unreadCount });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  markRead: async (req, res) => {
    try {
      await Notification.markRead(req.params.id, req.user.id);
      res.json({ message: 'Notification marked as read.' });
    } catch (error) {
      console.error('Mark read error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  markAllRead: async (req, res) => {
    try {
      await Notification.markAllRead(req.user.id, req.workspaceId);
      res.json({ message: 'All notifications marked as read.' });
    } catch (error) {
      console.error('Mark all read error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
};

module.exports = notificationController;
