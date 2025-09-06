const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // Changed from 'auth' to 'protect'
const { initiateBkashPayment, executeBkashPayment, getBkashPaymentStatus } = require('../controllers/bkashController');

// Initialize bKash payment
router.post('/initiate', protect, initiateBkashPayment);

// Execute bKash payment
router.post('/execute/:paymentId', protect, executeBkashPayment);

// Get payment status
router.get('/status/:paymentId', protect, getBkashPaymentStatus);

module.exports = router;