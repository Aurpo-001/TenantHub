const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createPaymentIntent,
  handleStripeWebhook,
  getPaymentDetails,
  getAllPayments
} = require('../controllers/paymentController');

// Create payment intent
router.post('/create-payment-intent', auth, createPaymentIntent);

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Get payment details
router.get('/:id', auth, getPaymentDetails);

// Get all payments (admin only)
router.get('/', auth, getAllPayments);

module.exports = router;
