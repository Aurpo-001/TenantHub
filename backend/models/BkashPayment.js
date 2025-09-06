const mongoose = require('mongoose');

const bkashPaymentSchema = new mongoose.Schema({
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
  amount: {
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
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  bkashNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['initiated', 'pending', 'completed', 'failed'],
    default: 'initiated'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate commission and owner share before saving
bkashPaymentSchema.pre('save', function(next) {
  if (this.isModified('amount')) {
    // Admin takes 10% commission
    this.adminCommission = this.amount * 0.10;
    // Owner gets 90%
    this.ownerShare = this.amount * 0.90;
  }
  next();
});

module.exports = mongoose.model('BkashPayment', bkashPaymentSchema);
