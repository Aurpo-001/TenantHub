const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  adminCommission: {
    type: Number,
    required: true
  },
  ownerShare: {
    type: Number,
    required: true
  },
  stripePaymentId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate commission and owner share before saving
paymentSchema.pre('save', function(next) {
  if (this.isModified('totalAmount')) {
    // Admin takes 10% commission
    this.adminCommission = this.totalAmount * 0.10;
    // Owner gets 90%
    this.ownerShare = this.totalAmount * 0.90;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
