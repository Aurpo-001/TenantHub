const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Property = require('../models/Property');

// Create a payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;
    
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

    // Calculate total amount (in cents for Stripe)
    const amountInCents = Math.round(booking.totalAmount * 100);

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        bookingId: booking._id.toString(),
        propertyId: booking.property._id.toString(),
        tenantId: booking.tenant._id.toString(),
        ownerId: booking.owner._id.toString()
      }
    });

    // Create payment record
    const payment = new Payment({
      booking: booking._id,
      property: booking.property._id,
      tenant: booking.tenant._id,
      owner: booking.owner._id,
      totalAmount: booking.totalAmount,
      stripePaymentId: paymentIntent.id,
    });
    await payment.save();

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent'
    });
  }
};

// Webhook to handle successful payments
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy'
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    try {
      // Update payment record
      const payment = await Payment.findOne({
        stripePaymentId: paymentIntent.id
      });
      
      if (payment) {
        payment.status = 'completed';
        await payment.save();

        // Update booking status
        const booking = await Booking.findById(payment.booking);
        if (booking) {
          booking.paymentStatus = 'paid';
          await booking.save();
        }
      }
    } catch (error) {
      console.error('Payment webhook processing error:', error);
    }
  }

  res.json({ received: true });
};

// Get payment details
exports.getPaymentDetails = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
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
      message: 'Error fetching payment details'
    });
  }
};

// Get all payments (admin only)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('booking')
      .populate('property')
      .populate('tenant', 'name email')
      .populate('owner', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payments'
    });
  }
};
