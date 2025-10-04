// app/api/transactions/deliver/route.js

import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
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

        // 1. Find Transaction
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            return NextResponse.json({ message: 'Transaction not found.' }, { status: 404 });
        }

        // 2. Authorization and State Checks
        // CRITICAL: Only the SELLER can mark it as delivered.
        if (transaction.sellerId.toString() !== userId) {
            return NextResponse.json({ message: 'Authorization error: Only the Seller can mark the item as delivered.' }, { status: 403 });
        }
        
        // CRITICAL CHECK: Status must be PAID_TO_ESCROW to proceed
        if (transaction.status !== 'PAID_TO_ESCROW') {
            return NextResponse.json({ message: `Cannot mark as delivered. Funds must be secured in escrow.` }, { status: 400 });
        }

        // 3. Status Update
        transaction.status = 'DELIVERED';
        await transaction.save();

        // 4. Success Response
        return NextResponse.json({
            success: true,
            message: 'Material status updated to DELIVERED. Buyer has been notified to confirm receipt.',
            data: { status: transaction.status },
        }, { status: 200 });

    } catch (error) {
        console.error('Mark As Delivered API Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}