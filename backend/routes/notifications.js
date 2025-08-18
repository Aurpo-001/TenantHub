const express = require('express');
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    getNotificationStats
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes (all notification routes require authentication)
router.use(protect);

// User routes
router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);

// Admin routes
router.post('/', authorize('admin'), createNotification);
router.get('/admin/stats', authorize('admin'), getNotificationStats);

module.exports = router;