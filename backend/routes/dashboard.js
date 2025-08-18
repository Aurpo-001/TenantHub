const express = require('express');
const {
    getOwnerDashboard,
    updateOwnerDashboard,
    generateMonthlyReport,
    getFinancialSummary,
    getAdminDashboard,
    getRecommendationAnalytics
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes (all dashboard routes require authentication)
router.use(protect);

// Owner routes
router.get('/owner', authorize('owner', 'admin'), getOwnerDashboard);
router.put('/owner', authorize('owner', 'admin'), updateOwnerDashboard);
router.post('/owner/reports/:month', authorize('owner', 'admin'), generateMonthlyReport);
router.get('/owner/financials', authorize('owner', 'admin'), getFinancialSummary);

// Admin routes
router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/admin/recommendations', authorize('admin'), getRecommendationAnalytics);

module.exports = router;