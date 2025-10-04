
// pages/api/dashboard/my-listings.js (FIXED IMPORTS)

// OLD (Incorrect): import dbConnect from '../../../../lib/dbConnect';
// NEW (Correct):
import dbConnect from '@/lib/dbConnect'; // Looks directly for the 'lib' folder

import Listing from '@/models/Listing'; 
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Assuming auth.js is in /lib
// ... rest of the code ...
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 1. CRITICAL: Authenticate the User
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }
  
  await dbConnect();
  
  try {
    // 2. Query Listings FILTERED by the authenticated user's ID
    const myListings = await Listing.find({ sellerId: session.user.id })
      .select('title materialType quantity pricePerUnit status createdAt') // Select fields for display
      .sort({ createdAt: -1 }); // Show most recent first

    // 3. Success Response
    res.status(200).json({ 
      success: true, 
      data: myListings,
      count: myListings.length,
    });

  } catch (error) {
    console.error('My Listings API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}