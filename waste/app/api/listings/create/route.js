// app/api/listings/create/route.js

import dbConnect from '@/lib/dbConnect';
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
    
    // Define the roles that are allowed to CREATE a listing
    const ALLOWED_SELLER_ROLES = ['Seller', 'Both'];
    
    // CRITICAL FIX: Check if session exists AND if the user's role is in the ALLOWED_SELLER_ROLES array
    if (!session || !session.user || !ALLOWED_SELLER_ROLES.includes(session.user.role)) {
        return NextResponse.json({ 
            message: 'Unauthorized. Account must be a Seller or Dual Role (Both).' 
        }, { status: 401 });
    }

    await dbConnect();
    
    try {
        // Read body data from the request object
        const { title, materialType, quantity, unit, pricePerUnit, locationName } = await readBody(request);
        const sellerId = session.user.id; 

        // 2. Input Validation (Basic)
        if (!title || !materialType || !quantity || !pricePerUnit) {
            return NextResponse.json({ message: 'Missing required listing details.' }, { status: 400 });
        }
        // NOTE: Frontend validation should ensure quantity/price > 0, but backend is the final gate.
        if (quantity <= 0 || pricePerUnit <= 0) {
             return NextResponse.json({ message: 'Quantity and Price must be positive values.' }, { status: 400 });
        }


        // 3. Create the Listing
        const newListing = await Listing.create({
            sellerId: sellerId, // Securely link the listing to the logged-in user
            title,
            materialType,
            quantity,
            unit,
            pricePerUnit,
            locationName,
            status: 'Active',
        });

        // 4. Success Response
        return NextResponse.json({ 
            success: true, 
            data: newListing, 
            message: 'Listing successfully created and posted to marketplace.' 
        }, { status: 201 }); // 201 Created status

    } catch (error) {
        console.error('Create Listing API Error:', error);
        
        // Handle MongoDB Duplicate Key Error (E11000 for KRA PIN)
        if (error.code === 11000) {
            return NextResponse.json({ 
                message: 'A resource conflict occurred. Check KRA PIN or email.' 
            }, { status: 409 });
        }

        // Default to a generic server error for any other issue
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}