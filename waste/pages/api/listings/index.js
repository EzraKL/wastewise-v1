// pages/api/listings/index.js
import dbConnect from '../../../lib/dbConnect';
import Listing from '../../../models/Listing';

export default async function handler(req, res) {
  // 1. Method Check
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Connect to the database
  await dbConnect();

  try {
    // 2. Query Active Listings
    // The .select() method is critical here: it restricts the fields returned.
    const listings = await Listing.find({ status: 'Active' })
      .select('title materialType quantity unit pricePerUnit locationName') // Only return safe, public fields
      .sort({ createdAt: -1 }) // Show newest listings first
      .limit(50); // Limit to 50 for faster initial load

    // 3. Success Response
    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });

  } catch (error) {
    console.error('Get Listings API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}