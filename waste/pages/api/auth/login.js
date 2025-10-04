// pages/api/auth/login.js

import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
// We'll use 'jsonwebtoken' for session management/auth tokens later
// For now, we will focus on password verification.

export default async function handler(req, res) {
  // 1. Method Check
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Connect to the database
  await dbConnect();

  try {
    const { email, password } = req.body;

    // 2. Input Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // 3. Find User
    const user = await User.findOne({ email });
    if (!user) {
      // Return a generic error to prevent email enumeration attacks
      return res.status(401).json({ message: 'Invalid credentials provided.' });
    }

    // 4. Compare Password (The core security step)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Generic error for incorrect password
      return res.status(401).json({ message: 'Invalid credentials provided.' });
    }

    // 5. Success & Token Generation (Placeholder for future JWT/Session Logic)
    // For now, we simply confirm success and the user's role.
    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
        // **IMPORTANT:** In a real app, you would generate a JWT here
        // and set it in an HTTP-Only cookie.
      },
    });

  } catch (error) {
    console.error('Login API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}