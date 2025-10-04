// app/api/transactions/pay/route.js

import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import Listing from '@/models/Listing';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server'; // CRITICAL: Use NextResponse

// Helper function to read the body data from the request object
const readBody = async (request) => {
    try {
        return await request.json();
    } catch (e) {
        return {}; 
    }
};

// Export the POST function for the Route Handler
export async function POST(request) {
    
    // 1. Authentication Check
   // app/api/listings/create/route.js (Line 21)
const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    await dbConnect();

    try {
        const { transactionId } = await readBody(request);
        const userId = session.user.id;

        // 2. Find and Validate Transaction
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            return NextResponse.json({ message: 'Transaction not found.' }, { status: 404 });
        }
        
        // 3. Authorization Check (Only the BUYER should be initiating payment)
        if (transaction.buyerId.toString() !== userId) {
            return NextResponse.json({ message: 'Authorization error: Only the Buyer can initiate payment.' }, { status: 403 });
        }

        // 4. State Check (Ensure we only process payment for PENDING transactions)
        if (transaction.status !== 'PENDING_PAYMENT') {
            return NextResponse.json({ message: `Payment already secured or transaction is ${transaction.status}.` }, { status: 400 });
        }

        // 5. *** CRITICAL ESCROW SIMULATION / UPDATE ***
        // This is the moment funds are secured.
        transaction.status = 'PAID_TO_ESCROW';
        await transaction.save();

        // 6. Update Listing Status: Mark the listing as Pending/Sold to prevent further offers
        await Listing.updateOne({ _id: transaction.listingId }, { status: 'Pending' });

        // 7. Success Response
        return NextResponse.json({
            success: true,
            message: 'Payment secured! Funds are held in escrow. Fulfillment process initiated.',
            data: { status: transaction.status, listingId: transaction.listingId, transactionId: transaction._id },
        }, { status: 200 });

    } catch (error) {
        console.error('Payment API Error:', error);
        // Handle specific errors (e.g., Mongoose validation errors) if needed
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}