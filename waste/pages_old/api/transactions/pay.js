// pages/api/transactions/pay.js
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import Listing from '@/models/Listing';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 1. Authentication Check
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  await dbConnect();

  try {
    const { transactionId } = req.body;
    const userId = session.user.id;

    // 2. Find and Validate Transaction
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }
    
    // 3. Authorization Check (Only the BUYER should be initiating payment)
    if (transaction.buyerId.toString() !== userId) {
        return res.status(403).json({ message: 'Authorization error: Only the Buyer can initiate payment.' });
    }

    // 4. State Check (Ensure we only process payment for PENDING transactions)
    if (transaction.status !== 'PENDING_PAYMENT') {
        return res.status(400).json({ message: `Payment already secured or transaction is ${transaction.status}.` });
    }

    // 5. *** CRITICAL ESCROW SIMULATION / UPDATE ***
    // This is the moment funds are secured.
    transaction.status = 'PAID_TO_ESCROW';
    await transaction.save();

    // 6. Update Listing Status: Mark the listing as Pending/Sold to prevent further offers
    await Listing.updateOne({ _id: transaction.listingId }, { status: 'Pending' });

    // 7. Success Response
    res.status(200).json({
      success: true,
      message: 'Payment secured! Funds are held in escrow. Fulfillment process initiated.',
      data: { status: transaction.status, listingId: transaction.listingId, transactionId: transaction._id },
    });

  } catch (error) {
    console.error('Payment API Error:', error);
    // Handle specific errors (e.g., Mongoose validation errors) if needed
    res.status(500).json({ message: 'Internal Server Error' });
  }
}