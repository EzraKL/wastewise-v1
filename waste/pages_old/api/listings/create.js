// pages/api/listings/create.js (CORRECTED AUTHORIZATION)
import dbConnect from '../../../lib/dbConnect';
import Listing from '../../../models/Listing';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth'; // Import your auth config

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Define the roles that are allowed to CREATE a listing
  const ALLOWED_SELLER_ROLES = ['Seller', 'Both'];
  
  // CRITICAL FIX: Authenticate and Authorize User
  const session = await getServerSession(req, res, authOptions);
  
  // Check if session exists AND if the user's role is in the ALLOWED_SELLER_ROLES array
  if (!session || !session.user || !ALLOWED_SELLER_ROLES.includes(session.user.role)) {
    return res.status(401).json({ 
      message: 'Unauthorized. Account must be a Seller or Dual Role (Both).' 
    });
  }

  await dbConnect();
  
  try {
    const { title, materialType, quantity, unit, pricePerUnit, locationName } = req.body;
    const sellerId = session.user.id; 

    // 2. Input Validation (Basic)
    if (!title || !materialType || !quantity || !pricePerUnit) {
      return res.status(400).json({ message: 'Missing required listing details.' });
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
    res.status(201).json({ 
      success: true, 
      data: newListing, 
      message: 'Listing successfully created and posted to marketplace.' 
    });

  } catch (error) {
    console.error('Create Listing API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}