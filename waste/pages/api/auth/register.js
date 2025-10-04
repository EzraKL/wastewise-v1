// pages/api/auth/register.js
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

// Handler for the API route
export default async function handler(req, res) {
  // Only allow POST requests for registration
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Connect to the database
  await dbConnect();

  try {
    const { companyName, email, password, kraPin, role } = req.body;

    // 1. Input Validation
    if (!email || !password || !companyName || !kraPin) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // 2. Check for existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    // 3. Hash the Password (The Security Step)
    const salt = await bcrypt.genSalt(10); // Generate salt (cost factor 10 is standard)
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create New User Document
    const newUser = await User.create({
      companyName,
      email,
      password: hashedPassword, // Store the hash, not the plain password
      kraPin,
      // Default to Seller, but allow role assignment if passed
      role: role || 'Seller',
    });

    // 5. Success Response
    // Do NOT return the password hash!
    res.status(201).json({
      success: true,
      data: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
      message: 'Registration successful. Welcome to WasteWise!',
    });

} catch (error) {
    console.error('Registration API Error:', error);
    
    // *** NEW LOGIC TO HANDLE DUPLICATE KEY ERRORS ***
    if (error.code === 11000) {
      // 409 Conflict: Indicates the resource (email or KRA PIN) already exists
      return res.status(409).json({ 
        message: 'A user with this KRA PIN or email already exists. Please login.' 
      });
    }

    // Default to a generic server error for any other issue
    res.status(500).json({ message: 'Internal Server Error' });
  }
}