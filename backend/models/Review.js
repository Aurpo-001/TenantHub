const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    reviewer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must have a reviewer']
    },
    reviewee: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must have a reviewee']
    },
    property: {
        type: mongoose.Schema.ObjectId,
        ref: 'Property',
        required: [true, 'Review must be related to a property']
    },
    booking: {
        type: mongoose.Schema.ObjectId,
        ref: 'Booking',
        required: [true, 'Review must be related to a booking']
    },
    rating: {
        overall: {
            type: Number,
            required: [true, 'Overall rating is required'],
            min: 1,
            max: 5
        },
        communication: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        responsiveness: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        propertyCondition: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        value: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        }
    },
    review: {
        title: {
            type: String,
            required: [true, 'Review title is required'],
            maxlength: 100
        },
        comment: {
            type: String,
            required: [true, 'Review comment is required'],
            maxlength: 1000
        },
        pros: [{
            type: String,
            maxlength: 200
        }],
        cons: [{
            type: String,
            maxlength: 200
        }]
    },
    reviewType: {
        type: String,
        enum: ['owner_review', 'tenant_review'],
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedAt: Date,
    responseTime: {
        type: Number, // in hours
        default: 0
    },
    wouldRecommend: {
        type: Boolean,
        required: true
    },
    ownerResponse: {
        response: {
            type: String,
            maxlength: 500
        },
        respondedAt: Date,
        respondedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    },
    helpfulVotes: {
        count: {
            type: Number,
            default: 0
        },
        users: [{
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }]
    },
    flags: {
        isFlagged: {
            type: Boolean,
            default: false
        },
        flaggedBy: [{
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            },
            reason: {
                type: String,
                enum: ['inappropriate', 'spam', 'fake', 'offensive', 'other']
            },
            flaggedAt: {
                type: Date,
                default: Date.now
            }
        }],
        adminReviewed: {
            type: Boolean,
            default: false
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to prevent duplicate reviews for same booking
reviewSchema.index({ reviewer: 1, booking: 1 }, { unique: true });

// Index for faster queries
reviewSchema.index({ reviewee: 1, isActive: 1, createdAt: -1 });
reviewSchema.index({ property: 1, isActive: 1 });
reviewSchema.index({ 'rating.overall': -1 });

// Update the updatedAt field before saving
reviewSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate and update owner's average rating after saving review
reviewSchema.post('save', async function() {
    try {
        const Review = this.constructor;
        
        // Calculate average ratings for the reviewee (owner)
        const stats = await Review.aggregate([
            {
                $match: {
                    reviewee: this.reviewee,
                    isActive: true,
                    reviewType: 'owner_review'
                }
            },
            {
                $group: {
                    _id: '$reviewee',
                    averageOverall: { $avg: '$rating.overall' },
                    averageCommunication: { $avg: '$rating.communication' },
                    averageResponsiveness: { $avg: '$rating.responsiveness' },
                    averagePropertyCondition: { $avg: '$rating.propertyCondition' },
                    averageValue: { $avg: '$rating.value' },
                    count: { $sum: 1 },
                    averageResponseTime: { $avg: '$responseTime' }
                }
            }
        ]);

        if (stats.length > 0) {
            const User = mongoose.model('User');
            await User.findByIdAndUpdate(this.reviewee, {
                'ownerProfile.ratings': {
                    overall: Math.round(stats[0].averageOverall * 10) / 10,
                    communication: Math.round(stats[0].averageCommunication * 10) / 10,
                    responsiveness: Math.round(stats[0].averageResponsiveness * 10) / 10,
                    propertyCondition: Math.round(stats[0].averagePropertyCondition * 10) / 10,
                    value: Math.round(stats[0].averageValue * 10) / 10,
                    count: stats[0].count
                },
                'ownerProfile.averageResponseTime': Math.round(stats[0].averageResponseTime)
            });
        }
    } catch (error) {
        console.error('Error updating owner ratings:', error);
    }
});

// Method to mark review as helpful
reviewSchema.methods.markAsHelpful = function(userId) {
    if (!this.helpfulVotes.users.includes(userId)) {
        this.helpfulVotes.users.push(userId);
        this.helpfulVotes.count += 1;
        return this.save();
    }
    return Promise.resolve(this);
};

// Method to remove helpful vote
reviewSchema.methods.removeHelpfulVote = function(userId) {
    const index = this.helpfulVotes.users.indexOf(userId);
    if (index > -1) {
        this.helpfulVotes.users.splice(index, 1);
        this.helpfulVotes.count -= 1;
        return this.save();
    }
    return Promise.resolve(this);
};

module.exports = mongoose.model('Review', reviewSchema);