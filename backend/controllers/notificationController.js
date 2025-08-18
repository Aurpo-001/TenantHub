const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 10, isRead } = req.query;

        // Build query
        const query = { recipient: req.user.id };
        if (isRead !== undefined) {
            query.isRead = isRead === 'true';
        }

        // Execute query with pagination
        const startIndex = (page - 1) * limit;
        const total = await Notification.countDocuments(query);

        const notifications = await Notification.find(query)
            .populate('sender', 'name email')
            .sort('-createdAt')
            .skip(startIndex)
            .limit(parseInt(limit));

        // Pagination result
        const pagination = {};
        if (startIndex + limit < total) {
            pagination.next = { page: parseInt(page) + 1, limit: parseInt(limit) };
        }
        if (startIndex > 0) {
            pagination.prev = { page: parseInt(page) - 1, limit: parseInt(limit) };
        }

        // Count unread notifications
        const unreadCount = await Notification.countDocuments({
            recipient: req.user.id,
            isRead: false
        });

        res.status(200).json({
            success: true,
            count: notifications.length,
            total,
            unreadCount,
            pagination,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching notifications',
            error: error.message
        });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Check if user owns this notification
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this notification'
            });
        }

        await notification.markAsRead();

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error updating notification',
            error: error.message
        });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { 
                isRead: true, 
                readAt: Date.now() 
            }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error updating notifications',
            error: error.message
        });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Check if user owns this notification
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this notification'
            });
        }

        await notification.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error deleting notification',
            error: error.message
        });
    }
};

// @desc    Create notification (Admin only)
// @route   POST /api/notifications
// @access  Private (Admin only)
exports.createNotification = async (req, res) => {
    try {
        const { 
            recipients, 
            type, 
            title, 
            message, 
            priority, 
            actionRequired, 
            actionUrl,
            expiresAt 
        } = req.body;

        // Create notifications for multiple recipients
        const notifications = [];
        
        for (const recipientId of recipients) {
            const notification = await Notification.create({
                recipient: recipientId,
                sender: req.user.id,
                type,
                title,
                message,
                priority: priority || 'medium',
                actionRequired: actionRequired || false,
                actionUrl,
                expiresAt
            });
            notifications.push(notification);
        }

        res.status(201).json({
            success: true,
            message: `${notifications.length} notifications created successfully`,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error creating notifications',
            error: error.message
        });
    }
};

// @desc    Get notification statistics (Admin only)
// @route   GET /api/notifications/admin/stats
// @access  Private (Admin only)
exports.getNotificationStats = async (req, res) => {
    try {
        const stats = await Notification.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    unreadCount: {
                        $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
                    }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const totalNotifications = await Notification.countDocuments();
        const totalUnread = await Notification.countDocuments({ isRead: false });

        res.status(200).json({
            success: true,
            data: {
                totalNotifications,
                totalUnread,
                byType: stats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching notification statistics',
            error: error.message
        });
    }
};