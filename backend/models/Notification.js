const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Notification must have a recipient']
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: [
            'booking_created',
            'booking_confirmed',
            'booking_rejected',
            'payment_received',
            'payment_failed',
            'visit_scheduled',
            'visit_reminder',
            'agreement_generated',
            'owner_response_required',
            'admin_message',
            'property_update',
            'system_update'
        ],
        required: [true, 'Notification must have a type']
    },
    title: {
        type: String,
        required: [true, 'Notification must have a title'],
        maxlength: 100
    },
    message: {
        type: String,
        required: [true, 'Notification must have a message'],
        maxlength: 500
    },
    relatedModel: {
        modelType: {
            type: String,
            enum: ['Booking', 'Property', 'Payment', 'User']
        },
        modelId: {
            type: mongoose.Schema.ObjectId
        }
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    deliveryMethod: {
        email: {
            sent: {
                type: Boolean,
                default: false
            },
            sentAt: Date,
            emailId: String
        },
        push: {
            sent: {
                type: Boolean,
                default: false
            },
            sentAt: Date
        },
        sms: {
            sent: {
                type: Boolean,
                default: false
            },
            sentAt: Date
        }
    },
    actionRequired: {
        type: Boolean,
        default: false
    },
    actionUrl: String, // URL for frontend to navigate to
    expiresAt: Date, // For time-sensitive notifications
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Mark as read
notificationSchema.methods.markAsRead = function() {
    this.isRead = true;
    this.readAt = Date.now();
    return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);