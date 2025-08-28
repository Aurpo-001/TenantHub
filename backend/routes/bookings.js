// backend/routes/bookings.js
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

// --- Admin first to avoid being matched by '/:id' ---
router.get('/admin/all', authorize('admin'), getAllBookingsAdmin);
router.put('/:id/admin-action', authorize('admin'), adminBookingAction);

// Then ID-based routes
router.get('/:id', getBooking);
router.post('/:id/payment', processPayment);

module.exports = router;
