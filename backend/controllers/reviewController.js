const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Property = require('../models/Property');

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
    try {
        const {
            bookingId,
            rating,
            review,
            responseTime,
            wouldRecommend
        } = req.body;

        // Check if booking exists and belongs to user
        const booking = await Booking.findById(bookingId)
            .populate('property')
            .populate('user');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.user._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to review this booking'
            });
        }

        if (booking.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Can only review completed bookings'
            });
        }

        // Check if review already exists for this booking
        const existingReview = await Review.findOne({
            reviewer: req.user.id,
            booking: bookingId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'Review already exists for this booking'
            });
        }

        // Create review
        const newReview = await Review.create({
            reviewer: req.user.id,
            reviewee: booking.property.owner,
            property: booking.property._id,
            booking: bookingId,
            rating,
            review,
            reviewType: 'owner_review',
            responseTime: responseTime || 0,
            wouldRecommend,
            isVerified: true, // Auto-verify since it's from completed booking
            verifiedAt: Date.now()
        });

        // Populate the review
        await newReview.populate([
            { path: 'reviewer', select: 'name email' },
            { path: 'reviewee', select: 'name email' },
            { path: 'property', select: 'title type location' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: newReview
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error creating review',
            error: error.message
        });
    }
};

// @desc    Get reviews for a user (owner)
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getUserReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = '-createdAt' } = req.query;

        // Build query
        const query = {
            reviewee: req.params.userId,
            isActive: true,
            reviewType: 'owner_review'
        };

        // Execute query with pagination
        const startIndex = (page - 1) * limit;
        const total = await Review.countDocuments(query);

        const reviews = await Review.find(query)
            .populate('reviewer', 'name')
            .populate('property', 'title type location')
            .sort(sortBy)
            .skip(startIndex)
            .limit(parseInt(limit));

        // Calculate overall statistics
        const stats = await Review.aggregate([
            {
                $match: query
            },
            {
                $group: {
                    _id: null,
                    averageOverall: { $avg: '$rating.overall' },
                    averageCommunication: { $avg: '$rating.communication' },
                    averageResponsiveness: { $avg: '$rating.responsiveness' },
                    averagePropertyCondition: { $avg: '$rating.propertyCondition' },
                    averageValue: { $avg: '$rating.value' },
                    totalReviews: { $sum: 1 },
                    recommendationRate: {
                        $avg: { $cond: ['$wouldRecommend', 1, 0] }
                    }
                }
            }
        ]);

        // Rating distribution
        const ratingDistribution = await Review.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$rating.overall',
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': -1 } }
        ]);

        // Pagination result
        const pagination = {};
        if (startIndex + limit < total) {
            pagination.next = { page: parseInt(page) + 1, limit: parseInt(limit) };
        }
        if (startIndex > 0) {
            pagination.prev = { page: parseInt(page) - 1, limit: parseInt(limit) };
        }

        res.status(200).json({
            success: true,
            count: reviews.length,
            total,
            pagination,
            statistics: stats[0] || {
                averageOverall: 0,
                averageCommunication: 0,
                averageResponsiveness: 0,
                averagePropertyCondition: 0,
                averageValue: 0,
                totalReviews: 0,
                recommendationRate: 0
            },
            ratingDistribution,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching reviews',
            error: error.message
        });
    }
};

// @desc    Get reviews for a property
// @route   GET /api/reviews/property/:propertyId
// @access  Public
exports.getPropertyReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const query = {
            property: req.params.propertyId,
            isActive: true
        };

        const startIndex = (page - 1) * limit;
        const total = await Review.countDocuments(query);

        const reviews = await Review.find(query)
            .populate('reviewer', 'name')
            .populate('reviewee', 'name')
            .sort('-createdAt')
            .skip(startIndex)
            .limit(parseInt(limit));

        const pagination = {};
        if (startIndex + limit < total) {
            pagination.next = { page: parseInt(page) + 1, limit: parseInt(limit) };
        }
        if (startIndex > 0) {
            pagination.prev = { page: parseInt(page) - 1, limit: parseInt(limit) };
        }

        res.status(200).json({
            success: true,
            count: reviews.length,
            total,
            pagination,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching property reviews',
            error: error.message
        });
    }
};

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
exports.markReviewHelpful = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        await review.markAsHelpful(req.user.id);

        res.status(200).json({
            success: true,
            message: 'Review marked as helpful',
            data: {
                helpfulVotes: review.helpfulVotes.count
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error updating review',
            error: error.message
        });
    }
};

// @desc    Owner respond to review
// @route   PUT /api/reviews/:id/respond
// @access  Private (Owner only)
exports.respondToReview = async (req, res) => {
    try {
        const { response } = req.body;

        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user is the reviewee (owner being reviewed)
        if (review.reviewee.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to respond to this review'
            });
        }

        review.ownerResponse = {
            response,
            respondedAt: Date.now(),
            respondedBy: req.user.id
        };

        await review.save();

        res.status(200).json({
            success: true,
            message: 'Response added successfully',
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error responding to review',
            error: error.message
        });
    }
};

// @desc    Flag review as inappropriate
// @route   PUT /api/reviews/:id/flag
// @access  Private
exports.flagReview = async (req, res) => {
    try {
        const { reason } = req.body;

        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user already flagged this review
        const existingFlag = review.flags.flaggedBy.find(
            flag => flag.user.toString() === req.user.id
        );

        if (existingFlag) {
            return res.status(400).json({
                success: false,
                message: 'You have already flagged this review'
            });
        }

        review.flags.flaggedBy.push({
            user: req.user.id,
            reason,
            flaggedAt: Date.now()
        });

        // Mark as flagged if enough flags
        if (review.flags.flaggedBy.length >= 3) {
            review.flags.isFlagged = true;
        }

        await review.save();

        res.status(200).json({
            success: true,
            message: 'Review flagged successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error flagging review',
            error: error.message
        });
    }
};

// @desc    Get flagged reviews (Admin only)
// @route   GET /api/reviews/admin/flagged
// @access  Private (Admin only)
exports.getFlaggedReviews = async (req, res) => {
    try {
        const flaggedReviews = await Review.find({
            'flags.isFlagged': true,
            'flags.adminReviewed': false
        })
        .populate('reviewer', 'name email')
        .populate('reviewee', 'name email')
        .populate('property', 'title location')
        .populate('flags.flaggedBy.user', 'name email')
        .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: flaggedReviews.length,
            data: flaggedReviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching flagged reviews',
            error: error.message
        });
    }
};

// @desc    Admin review flagged content
// @route   PUT /api/reviews/:id/admin-review
// @access  Private (Admin only)
exports.adminReviewFlag = async (req, res) => {
    try {
        const { action, adminNotes } = req.body; // action: 'approve' or 'remove'

        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        review.flags.adminReviewed = true;

        if (action === 'remove') {
            review.isActive = false;
        } else if (action === 'approve') {
            review.flags.isFlagged = false;
        }

        await review.save();

        res.status(200).json({
            success: true,
            message: `Review ${action}d successfully`,
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error processing admin review',
            error: error.message
        });
    }
};