// pages/api/listings/[id].js
// FIX: Use the configured alias '@/lib/...' instead of counting '../../..'
import dbConnect from '@/lib/dbConnect';
import Listing from '@/models/Listing';

export default async function handler(req, res) {
  // Use the query object to get the dynamic ID from the URL
  const { query: { id } } = req; 

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await dbConnect();

  try {
    // Find the listing by its ID
    // We exclude sensitive/unnecessary fields even for the single view
    const listing = await Listing.findById(id).select('-sellerId -__v'); 

    if (!listing || listing.status !== 'Active') {
      return res.status(404).json({ message: 'Listing not found or unavailable.' });
    }

    // Success response
    res.status(200).json({ success: true, data: listing });

  } catch (error) {
    // If the ID format is invalid (e.g., not a valid MongoDB ObjectId), it will hit this block
    console.error('Get Single Listing API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}