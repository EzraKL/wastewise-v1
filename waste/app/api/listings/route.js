// app/api/listings/route.js

import dbConnect from '@/lib/dbConnect';
import Listing from '@/models/Listing';
import { NextResponse } from 'next/server'; // CRITICAL: Use NextResponse

// Export the GET function for the Route Handler
export async function GET(request) {
    
    // 1. Method Check: Handled implicitly by exporting only the GET function.
    // Connect to the database
    await dbConnect();

    try {
        // 2. Query Active Listings
        const listings = await Listing.find({ status: 'Active' })
            // FIX: Ensure sellerId is included for the frontend's 'isOwnListing' check
            .select('title materialType quantity unit pricePerUnit locationName sellerId') 
            .sort({ createdAt: -1 }) // Show newest listings first
            .limit(50); // Limit to 50 for faster initial load

        // 3. Success Response
        return NextResponse.json({
            success: true,
            count: listings.length,
            data: listings,
        }, { status: 200 });

    } catch (error) {
        console.error('Get Listings API Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}