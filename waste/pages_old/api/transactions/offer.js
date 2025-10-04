// pages/api/transactions/offer.js (CORRECTED AUTHORIZATION)
import dbConnect from '../../../lib/dbConnect';
import Transaction from '../../../models/Transaction';
import Listing from '../../../models/Listing';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth'; // Import your auth config

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Define the roles that are allowed to make an offer
  const ALLOWED_BUYER_ROLES = ['Buyer', 'Both'];
  
  // 1. Authenticate and Authorize User (REVISED LOGIC)
  const session = await getServerSession(req, res, authOptions);
  
  // Check if session exists AND if the user's role is in the ALLOWED_BUYER_ROLES array
  if (!session || !session.user || !ALLOWED_BUYER_ROLES.includes(session.user.role)) {
    return res.status(401).json({ 
      message: 'Unauthorized. Account must be a Buyer or Dual Role (Both) to submit an offer.' 
    });
  }

  await dbConnect();

  try {
    const { listingId, agreedPrice, agreedQuantity } = req.body;
    const buyerId = session.user.id; 

    // 2. Validate Listing Existence and Status
    const listing = await Listing.findById(listingId).select('sellerId status');

    if (!listing || listing.status !== 'Active') {
      return res.status(404).json({ message: 'Listing not found or is no longer active.' });
    }

    // 3. Prevent Self-Transaction (Authorization Check)
    if (listing.sellerId.toString() === buyerId) {
      return res.status(403).json({ message: 'Cannot make an offer on your own listing.' });
    }

    // 4. Check for Existing Offer (Optional: Prevent duplicates)
    const existingTransaction = await Transaction.findOne({ 
        listingId, 
        buyerId, 
        status: { $in: ['PENDING_PAYMENT'] } 
    });
    if (existingTransaction) {
        return res.status(409).json({ message: 'An active offer already exists for this listing.' });
    }

    // 5. Create New Transaction (The Offer)
    const newTransaction = await Transaction.create({
      listingId,
      sellerId: listing.sellerId,
      buyerId,
      agreedPrice,
      agreedQuantity,
      status: 'PENDING_PAYMENT',
    });

    // 6. Success Response
    res.status(201).json({
      success: true,
      data: newTransaction,
      message: 'Offer submitted. Proceed to secure payment.',
    });

  } catch (error) {
    console.error('Create Offer API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}