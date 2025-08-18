const express = require('express');
const {
    createReview,
    getUserReviews,
    getPropertyReviews,
    markReviewHelpful,
    respondToReview,
    flagReview,
    getFlaggedReviews,
    adminReviewFlag
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/user/:userId', getUserReviews);
router.get('/property/:propertyId', getPropertyReviews);

// Protected routes
router.use(protect);

// User routes
router.post('/', createReview);
router.put('/:id/helpful', markReviewHelpful);
router.put('/:id/respond', authorize('owner', 'admin'), respondToReview);
router.put('/:id/flag', flagReview);

// Admin routes
router.get('/admin/flagged', authorize('admin'), getFlaggedReviews);
router.put('/:id/admin-review', authorize('admin'), adminReviewFlag);

module.exports = router;