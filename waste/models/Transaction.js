// models/Transaction.js
import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  agreedPrice: {
    type: Number,
    required: true,
  },
  agreedQuantity: {
    type: Number,
    required: true,
  },
  commissionRate: {
    type: Number,
    default: 0.08, // 8% commission rate (example)
  },
  // CRITICAL: Tracks the payment and fulfillment status
  status: {
    type: String,
    enum: ['PENDING_PAYMENT', 'PAID_TO_ESCROW', 'DELIVERED', 'COMPLETED', 'CANCELED'],
    default: 'PENDING_PAYMENT',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);