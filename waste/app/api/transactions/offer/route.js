// app/api/transactions/offer/route.js

import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import Listing from '@/models/Listing';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Helper function to read the body data from the request object
const readBody = async (request) => {
    try {
        return await request.json();
    } catch (e) {
        // If JSON is invalid or body is empty, throw a specific error
        throw new Error('Invalid or empty request body.'); 
    }
};

// Export the POST function for the Route Handler
export async function POST(request) {
    
    // Define the roles that are allowed to make an offer
    const ALLOWED_BUYER_ROLES = ['Buyer', 'Both'];
    
    // 1. Authenticate and Authorize User (CORRECT APP ROUTER USAGE)
    const session = await getServerSession(authOptions); 
    
    // Check if session exists AND if the user's role is in the ALLOWED_BUYER_ROLES array
    if (!session || !session.user || !ALLOWED_BUYER_ROLES.includes(session.user.role)) {
        return NextResponse.json({ 
            message: 'Unauthorized. Account must be a Buyer or Dual Role (Both) to submit an offer.' 
        }, { status: 401 });
    }

    await dbConnect();

    try {
        // CRITICAL FIX: Add 'await' to ensure the request body is fully read before destructuring
        const { listingId, agreedPrice, agreedQuantity } = await readBody(request);
        const buyerId = session.user.id; 

        // 2. Validate Listing Existence and Status
        const listing = await Listing.findById(listingId).select('sellerId status');

        if (!listing || listing.status !== 'Active') {
            return NextResponse.json({ message: 'Listing not found or is no longer active.' }, { status: 404 });
        }

        // 3. Prevent Self-Transaction (Authorization Check)
        if (listing.sellerId.toString() === buyerId) {
            return NextResponse.json({ message: 'Cannot make an offer on your own listing.' }, { status: 403 });
        }

        // 4. Check for Existing Offer (Optional: Prevent duplicates)
        const existingTransaction = await Transaction.findOne({ 
            listingId, 
            buyerId, 
            status: { $in: ['PENDING_PAYMENT'] } 
        });
        if (existingTransaction) {
            return NextResponse.json({ message: 'An active offer already exists for this listing.' }, { status: 409 });
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
        return NextResponse.json({
            success: true,
            data: newTransaction,
            message: 'Offer submitted. Proceed to secure payment.',
        }, { status: 201 }); // 201 Created Status

    } catch (error) {
        // Log the full error for server debugging
        console.error('Mongoose/API Crash Error:', error);

        // Handle Mongoose Validation Error (Mongoose's way of returning 400 Bad Request)
        if (error.name === 'ValidationError') {
            return NextResponse.json({ 
                message: `Validation Error: ${error.message}` 
            }, { status: 400 }); 
        }
        
        // Handle custom Body Read Error
        if (error.message.includes('Invalid or empty request body')) {
             return NextResponse.json({ message: error.message }, { status: 400 });
        }

        return NextResponse.json({ 
            message: 'Internal Database Error. Check server logs for Mongoose details.' 
        }, { status: 500 });
    }
}