const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.ObjectId,
        ref: 'Property',
        required: [true, 'Booking must belong to a property']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a user']
    },
    bookingType: {
        type: String,
        enum: ['rent', 'visit'],
        required: [true, 'Please specify booking type'],
        default: 'rent'
    },
    visitDate: {
        type: Date,
        required: function() {
            return this.bookingType === 'visit';
        }
    },
    visitTimeSlot: {
        type: String,
        enum: ['morning', 'afternoon', 'evening'],
        required: function() {
            return this.bookingType === 'visit';
        }
    },
    rentalPeriod: {
        startDate: {
            type: Date,
            required: function() {
                return this.bookingType === 'rent';
            }
        },
        endDate: {
            type: Date,
            required: function() {
                return this.bookingType === 'rent';
            }
        },
        duration: {
            type: Number, // in months
            required: function() {
                return this.bookingType === 'rent';
            }
        }
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    },
    adminApproval: {
        isApproved: {
            type: Boolean,
            default: false
        },
        approvedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        approvedAt: Date,
        adminNotes: String
    },
    ownerResponse: {
        isResponded: {
            type: Boolean,
            default: false
        },
        response: {
            type: String,
            enum: ['accepted', 'rejected', 'negotiating']
        },
        responseTime: Date,
        ownerNotes: String
    },
    payment: {
        advanceAmount: {
            type: Number,
            required: function() {
                return this.status === 'completed';
            }
        },
        adminCommission: {
            type: Number,
            default: 0
        },
        ownerAmount: {
            type: Number,
            default: 0
        },
        commissionPercentage: {
            type: Number,
            default: 10 // 10% commission
        },
        isPaid: {
            type: Boolean,
            default: false
        },
        paymentDate: Date,
        paymentMethod: {
            type: String,
            enum: ['card', 'bank_transfer', 'mobile_banking', 'cash']
        },
        transactionId: String
    },
    contactInfo: {
        userMessage: {
            type: String,
            maxlength: 500
        },
        userPhone: String,
        preferredContactTime: String,
        adminContactedOwner: {
            type: Boolean,
            default: false
        },
        adminContactDate: Date
    },
    agreement: {
        isGenerated: {
            type: Boolean,
            default: false
        },
        agreementUrl: String,
        generatedAt: Date,
        digitalSignature: {
            userSigned: {
                type: Boolean,
                default: false
            },
            ownerSigned: {
                type: Boolean,
                default: false
            },
            userSignedAt: Date,
            ownerSignedAt: Date
        }
    },
    timeline: [{
        action: {
            type: String,
            required: true
        },
        performedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        notes: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
bookingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate payment split when advance amount is set
bookingSchema.pre('save', function(next) {
    if (this.payment.advanceAmount && this.payment.commissionPercentage) {
        this.payment.adminCommission = (this.payment.advanceAmount * this.payment.commissionPercentage) / 100;
        this.payment.ownerAmount = this.payment.advanceAmount - this.payment.adminCommission;
    }
    next();
});

// Add timeline entry when status changes
bookingSchema.pre('save', function(next) {
    if (this.isModified('status') && !this.isNew) {
        this.timeline.push({
            action: `Status changed to ${this.status}`,
            timestamp: Date.now()
        });
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);