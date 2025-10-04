// pages/api/transactions/complete.js
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import Listing from '@/models/Listing';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  await dbConnect();

  try {
    const { transactionId } = req.body;
    const userId = session.user.id;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) { return res.status(404).json({ message: 'Transaction not found.' }); }

    // 1. Authorization and State Checks
    if (transaction.buyerId.toString() !== userId) {
        return res.status(403).json({ message: 'Authorization error: Only the Buyer can confirm receipt.' });
    }
    // CRITICAL CHECK: Must be DELIVERED to confirm
    if (transaction.status !== 'DELIVERED') {
        return res.status(400).json({ message: `Cannot complete transaction. Status must be DELIVERED.` });
    }


    // 2. *** FINAL ESCROW ACTION ***
    transaction.status = 'COMPLETED';
    // NOTE: This is where commission logic would execute (send 8% to WasteWise account, 92% to Seller).
    await transaction.save();

    // 3. Update Listing Status: Mark the listing as permanently Sold
    await Listing.updateOne({ _id: transaction.listingId }, { status: 'Sold' });


    // 4. Success Response
    res.status(200).json({
      success: true,
      message: 'Receipt confirmed and funds released to the seller. Transaction closed.',
      data: { status: transaction.status },
    });

  } catch (error) {
    console.error('Complete Transaction API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}