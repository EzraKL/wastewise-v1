// pages/api/transactions/deliver.js
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
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

    // 1. Find Transaction
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    // 2. Authorization and State Checks
    // CRITICAL: Only the SELLER can mark it as delivered.
    if (transaction.sellerId.toString() !== userId) {
        return res.status(403).json({ message: 'Authorization error: Only the Seller can mark the item as delivered.' });
    }
    
    // CRITICAL CHECK: Status must be PAID_TO_ESCROW to proceed
    if (transaction.status !== 'PAID_TO_ESCROW') {
        return res.status(400).json({ message: `Cannot mark as delivered. Funds must be secured in escrow.` });
    }

    // 3. Status Update
    transaction.status = 'DELIVERED';
    await transaction.save();

    // 4. Success Response
    res.status(200).json({
      success: true,
      message: 'Material status updated to DELIVERED. Buyer has been notified to confirm receipt.',
      data: { status: transaction.status },
    });

  } catch (error) {
    console.error('Mark As Delivered API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}