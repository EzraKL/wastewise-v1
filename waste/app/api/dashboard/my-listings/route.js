// app/api/dashboard/my-listings/route.js

import dbConnect from '@/lib/dbConnect';
import Listing from '@/models/Listing';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server'; // CRITICAL: Use NextResponse for API responses

// Export the GET function for the Route Handler
export async function GET(request) {
    
    // 1. CRITICAL: Authenticate the User
    // NOTE: In App Router, getServerSession requires you to pass the request/response, 
    // but the Route Handler's structure simplifies this:
    const session = await getServerSession(request, { 
        // Pass a dummy res object or the actual response object if you had one,
        // but for read operations, the session is usually enough.
        // We rely on the authOptions configuration to find the session.
    }, authOptions); 

    // Re-check session validity and required data
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: 'Unauthorized. Please log in.' }, { status: 401 });
    }
    
    // Authorization Check: The user must be a seller or both (This logic is handled by the frontend, 
    // but the API must be ready for any authenticated user to view their own data.)
    
    await dbConnect();
    
    try {
        // 2. Query Listings FILTERED by the authenticated user's ID
        const myListings = await Listing.find({ sellerId: session.user.id })
            .select('title materialType quantity pricePerUnit status createdAt') // Select fields for display
            .sort({ createdAt: -1 }); // Show most recent first

        // 3. Success Response (Using NextResponse)
        return NextResponse.json({ 
            success: true, 
            data: myListings,
            count: myListings.length,
        }, { status: 200 });

    } catch (error) {
        console.error('My Listings API Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}