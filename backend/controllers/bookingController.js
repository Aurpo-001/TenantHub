const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
    try {
        const { propertyId, bookingType, visitDate, visitTimeSlot, rentalPeriod, userMessage, preferredContactTime } = req.body;

        // Check if property exists and is available
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        if (!property.availability.isAvailable) {
            return res.status(400).json({
                success: false,
                message: 'Property is not available for booking'
            });
        }

        // Create booking
        const bookingData = {
            property: propertyId,
            user: req.user.id,
            bookingType,
            contactInfo: {
                userMessage,
                userPhone: req.user.phone,
                preferredContactTime
            },
            timeline: [{
                action: 'Booking created',
                performedBy: req.user.id,
                timestamp: Date.now()
            }]
        };

        // Add specific fields based on booking type
        if (bookingType === 'visit') {
            bookingData.visitDate = visitDate;
            bookingData.visitTimeSlot = visitTimeSlot;
        } else if (bookingType === 'rent') {
            bookingData.rentalPeriod = rentalPeriod;
        }

        const booking = await Booking.create(bookingData);

        // Populate the booking with property and user details
        await booking.populate([
            { path: 'property', select: 'title price location owner' },
            { path: 'user', select: 'name email phone' }
        ]);

        // Create notification for admin
        await Notification.create({
            recipient: await User.findOne({ role: 'admin' }).select('_id'),
            type: 'booking_created',
            title: 'New Booking Request',
            message: `${req.user.name} has requested to ${bookingType} ${property.title}`,
            relatedModel: {
                modelType: 'Booking',
                modelId: booking._id
            },
            actionRequired: true,
            priority: 'high'
        });

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error creating booking',
            error: error.message
        });
    }
};

// @desc    Get all bookings for user
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('property', 'title price location images')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching bookings',
            error: error.message
        });
    }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('property')
            .populate('user', 'name email phone')
            .populate('timeline.performedBy', 'name role');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns this booking or is admin/owner
        if (booking.user._id.toString() !== req.user.id && 
            req.user.role !== 'admin' && 
            (req.user.role !== 'owner' || booking.property.owner.toString() !== req.user.id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this booking'
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching booking',
            error: error.message
        });
    }
};

// @desc    Admin approve/reject booking
// @route   PUT /api/bookings/:id/admin-action
// @access  Private (Admin only)
exports.adminBookingAction = async (req, res) => {
    try {
        const { action, adminNotes } = req.body; // action: 'approve' or 'reject'

        const booking = await Booking.findById(req.params.id)
            .populate('property')
            .populate('user', 'name email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (action === 'approve') {
            booking.adminApproval.isApproved = true;
            booking.adminApproval.approvedBy = req.user.id;
            booking.adminApproval.approvedAt = Date.now();
            booking.adminApproval.adminNotes = adminNotes;
            booking.status = 'confirmed';

            // Contact owner notification would be sent here
            booking.contactInfo.adminContactedOwner = true;
            booking.contactInfo.adminContactDate = Date.now();

            // Create notification for user
            await Notification.create({
                recipient: booking.user._id,
                type: 'booking_confirmed',
                title: 'Booking Confirmed',
                message: `Your booking for ${booking.property.title} has been confirmed by admin`,
                relatedModel: {
                    modelType: 'Booking',
                    modelId: booking._id
                },
                priority: 'high'
            });

        } else if (action === 'reject') {
            booking.status = 'rejected';
            booking.adminApproval.adminNotes = adminNotes;

            // Create notification for user
            await Notification.create({
                recipient: booking.user._id,
                type: 'booking_rejected',
                title: 'Booking Rejected',
                message: `Your booking for ${booking.property.title} has been rejected. Reason: ${adminNotes}`,
                relatedModel: {
                    modelType: 'Booking',
                    modelId: booking._id
                },
                priority: 'high'
            });
        }

        booking.timeline.push({
            action: `Admin ${action}ed booking`,
            performedBy: req.user.id,
            notes: adminNotes,
            timestamp: Date.now()
        });

        await booking.save();

        res.status(200).json({
            success: true,
            message: `Booking ${action}ed successfully`,
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error processing admin action',
            error: error.message
        });
    }
};

// @desc    Get all bookings for admin
// @route   GET /api/bookings/admin/all
// @access  Private (Admin only)
exports.getAllBookingsAdmin = async (req, res) => {
    try {
        const { status, type, page = 1, limit = 10 } = req.query;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (type) query.bookingType = type;

        // Execute query with pagination
        const startIndex = (page - 1) * limit;
        const total = await Booking.countDocuments(query);

        const bookings = await Booking.find(query)
            .populate('property', 'title price location')
            .populate('user', 'name email phone')
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

        res.status(200).json({
            success: true,
            count: bookings.length,
            total,
            pagination,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching bookings',
            error: error.message
        });
    }
};

// @desc    Process advance payment
// @route   POST /api/bookings/:id/payment
// @access  Private
exports.processPayment = async (req, res) => {
    try {
        const { paymentMethod, transactionId, advanceAmount } = req.body;

        const booking = await Booking.findById(req.params.id)
            .populate('property', 'title price')
            .populate('user', 'name email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns this booking
        if (booking.user._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to make payment for this booking'
            });
        }

        if (booking.status !== 'confirmed') {
            return res.status(400).json({
                success: false,
                message: 'Booking must be confirmed before payment'
            });
        }

        // Update payment information
        booking.payment.advanceAmount = advanceAmount;
        booking.payment.paymentMethod = paymentMethod;
        booking.payment.transactionId = transactionId;
        booking.payment.isPaid = true;
        booking.payment.paymentDate = Date.now();

        // Commission calculation is handled by the pre-save middleware
        await booking.save();

        // Update booking status
        booking.status = 'completed';
        booking.timeline.push({
            action: 'Payment processed',
            performedBy: req.user.id,
            notes: `Advance payment of $${advanceAmount} received`,
            timestamp: Date.now()
        });

        await booking.save();

        // Create notification for admin
        await Notification.create({
            recipient: await User.findOne({ role: 'admin' }).select('_id'),
            type: 'payment_received',
            title: 'Payment Received',
            message: `Payment of $${advanceAmount} received for ${booking.property.title}`,
            relatedModel: {
                modelType: 'Booking',
                modelId: booking._id
            },
            priority: 'medium'
        });

        res.status(200).json({
            success: true,
            message: 'Payment processed successfully',
            data: {
                booking: booking,
                paymentDetails: {
                    advanceAmount: booking.payment.advanceAmount,
                    adminCommission: booking.payment.adminCommission,
                    ownerAmount: booking.payment.ownerAmount,
                    commissionPercentage: booking.payment.commissionPercentage
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error processing payment',
            error: error.message
        });
    }
};