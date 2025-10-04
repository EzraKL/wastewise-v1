// app/api/listings/[id]/route.js

import dbConnect from '@/lib/dbConnect';
import Listing from '@/models/Listing';
import { NextResponse } from 'next/server'; // CRITICAL: Use NextResponse

// Export the GET function for the Route Handler. 
// We receive 'params' which contains the dynamic segment 'id'.
export async function GET(request, { params }) {
  
  // Access the dynamic segment 'id' from the URL
  const id = params.id; 

  // 1. Method Check (Implicitly handled by the exported GET function, but good practice to show structure)
  // No need for a separate check since we only export GET.

  await dbConnect();

  try {
    // 2. Find the listing by its ID
    // We exclude sensitive/unnecessary fields even for the single view
    const listing = await Listing.findById(id).select('-sellerId -__v'); 

    if (!listing || listing.status !== 'Active') {
      return NextResponse.json({ message: 'Listing not found or unavailable.' }, { status: 404 });
    }

    // 3. Success response
    return NextResponse.json({ success: true, data: listing }, { status: 200 });

  } catch (error) {
    // If the ID format is invalid (e.g., not a valid MongoDB ObjectId), it will hit this block
    console.error('Get Single Listing API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}