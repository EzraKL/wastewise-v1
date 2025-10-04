// app/api/transactions/complete/route.js

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

        const transaction = await Transaction.findById(transactionId);
        
        if (!transaction) { 
            return NextResponse.json({ message: 'Transaction not found.' }, { status: 404 }); 
        }

        // 2. Authorization and State Checks
        if (transaction.buyerId.toString() !== userId) {
            return NextResponse.json({ message: 'Authorization error: Only the Buyer can confirm receipt.' }, { status: 403 });
        }
        
        // CRITICAL CHECK: Must be DELIVERED to confirm (not PENDING_PAYMENT or CANCELED)
        if (transaction.status !== 'DELIVERED') {
            return NextResponse.json({ message: `Cannot complete transaction. Status must be DELIVERED.` }, { status: 400 });
        }


        // 3. *** FINAL ESCROW ACTION: Update and Save ***
        transaction.status = 'COMPLETED';
        // NOTE: This is where commission logic would execute (transfer funds via M-Pesa API)
        await transaction.save();

        // 4. Update Listing Status: Mark the listing as permanently Sold
        await Listing.updateOne({ _id: transaction.listingId }, { status: 'Sold' });


        // 5. Success Response
        return NextResponse.json({
            success: true,
            message: 'Receipt confirmed and funds released to the seller. Transaction closed.',
            data: { status: transaction.status },
        }, { status: 200 });

    } catch (error) {
        console.error('Complete Transaction API Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}