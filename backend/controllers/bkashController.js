const BkashPayment = require('../models/BkashPayment');
const Booking = require('../models/Booking');

// Mock bKash API integration
const mockBkashAPI = {
    createPayment: async (amount, number) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate a mock transaction ID
        const transactionId = 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
        
        // Simulate success (90% success rate)
        if (Math.random() < 0.9) {
            return {
                success: true,
                transactionId,
                message: 'Payment initiated successfully'
            };
        } else {
            throw new Error('bKash payment initiation failed');
        }
    },
    
    executePayment: async (transactionId) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate success (95% success rate)
        if (Math.random() < 0.95) {
            return {
                success: true,
                transactionId,
                message: 'Payment completed successfully'
            };
        } else {
            throw new Error('bKash payment execution failed');
        }
    }
};

// @desc    Initialize bKash payment
// @route   POST /api/bkash/initiate
// @access  Private
const initiateBkashPayment = async (req, res) => {
    try {
        const { bookingId, bkashNumber } = req.body;

        if (!bookingId || !bkashNumber) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID and bKash number are required'
            });
        }

        // Validate bKash number format (11 digits)
        if (!/^01\d{9}$/.test(bkashNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid bKash number format'
            });
        }

        // Get booking details
        const booking = await Booking.findById(bookingId)
            .populate('property')
            .populate('tenant')
            .populate('owner');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if booking already has a pending payment
        const existingPayment = await BkashPayment.findOne({
            booking: bookingId,
            status: 'pending'
        });

        if (existingPayment) {
            return res.status(400).json({
                success: false,
                message: 'This booking already has a pending payment'
            });
        }

        // Create payment with bKash API
        const bkashResponse = await mockBkashAPI.createPayment(
            booking.totalAmount,
            bkashNumber
        );

        // Create payment record
        const payment = new BkashPayment({
            booking: booking._id,
            property: booking.property._id,
            tenant: booking.tenant._id,
            owner: booking.owner._id,
            amount: booking.totalAmount,
            bkashNumber,
            transactionId: bkashResponse.transactionId,
            status: 'pending'
        });

        await payment.save();

        // Update booking status
        booking.paymentStatus = 'pending';
        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Payment initiated successfully',
            data: {
                paymentId: payment._id,
                transactionId: payment.transactionId,
                amount: payment.amount,
                status: payment.status
            }
        });

    } catch (error) {
        console.error('bKash payment initiation error:', error);
        
        // Try to roll back any saved data if there was an error
        if (error.payment) {
            await BkashPayment.findByIdAndDelete(error.payment._id);
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to initiate bKash payment',
            error: error.message
        });
    }
};

// @desc    Execute bKash payment
// @route   POST /api/bkash/execute/:paymentId
// @access  Private
const executeBkashPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await BkashPayment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        if (payment.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Payment already completed'
            });
        }

        // Execute payment with bKash API
        const bkashResponse = await mockBkashAPI.executePayment(
            payment.transactionId
        );

        // Update payment status
        payment.status = 'completed';
        await payment.save();

        // Update booking status
        const booking = await Booking.findById(payment.booking);
        if (booking) {
            booking.paymentStatus = 'paid';
            await booking.save();
        }

        res.status(200).json({
            success: true,
            message: 'Payment completed successfully',
            data: {
                paymentId: payment._id,
                transactionId: payment.transactionId,
                amount: payment.amount,
                status: payment.status
            }
        });

    } catch (error) {
        console.error('bKash payment execution error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error executing bKash payment'
        });
    }
};

// @desc    Get payment status
// @route   GET /api/bkash/status/:paymentId
// @access  Private
const getBkashPaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await BkashPayment.findById(paymentId)
            .populate('booking')
            .populate('property')
            .populate('tenant', 'name email')
            .populate('owner', 'name email');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        res.status(200).json({
            success: true,
            data: payment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching payment status'
        });
    }
};

module.exports = {
    initiateBkashPayment,
    executeBkashPayment,
    getBkashPaymentStatus
};
