const express = require('express');
const {
    createBooking,
    getMyBookings,
    getBooking,
    adminBookingAction,
    getAllBookingsAdmin,
    processPayment
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes (all booking routes require authentication)
router.use(protect);

// User routes
router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBooking);
router.post('/:id/payment', processPayment);

// Admin routes
router.get('/admin/all', authorize('admin'), getAllBookingsAdmin);
router.put('/:id/admin-action', authorize('admin'), adminBookingAction);

module.exports = router;