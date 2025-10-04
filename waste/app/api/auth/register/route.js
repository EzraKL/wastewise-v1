// app/api/auth/register/route.js

import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server'; // CRITICAL: Use NextResponse for API responses

// Helper function to read the body since we don't have the Express 'req.body' object
const readBody = async (request) => {
    try {
        return await request.json();
    } catch (e) {
        return {}; // Return empty object if body is missing or invalid JSON
    }
};

// Export the POST function for the Route Handler
export async function POST(request) {
    // Connect to the database
    await dbConnect();

    try {
        // Use request.json() to read the body in App Router
        const { companyName, email, password, kraPin, role } = await readBody(request);

        // 1. Input Validation
        if (!email || !password || !companyName || !kraPin) {
            return NextResponse.json(
                { message: 'Missing required fields.' },
                { status: 400 }
            );
        }

        // 2. Check for existing user
        const userExists = await User.findOne({ email });
        if (userExists) {
            return NextResponse.json(
                { message: 'User with this email already exists.' },
                { status: 409 }
            );
        }

        // 3. Hash the Password (The Security Step)
        const salt = await bcrypt.genSalt(10); 
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
        return NextResponse.json({
            success: true,
            data: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role,
            },
            message: 'Registration successful. Welcome to WasteWise!',
        }, { status: 201 }); // 201 Created status

    } catch (error) {
        console.error('Registration API Error:', error);
        
        // Handle MongoDB Duplicate Key Error (E11000)
        if (error.code === 11000) {
            return NextResponse.json({ 
                message: 'A user with this KRA PIN or email already exists. Please login.' 
            }, { status: 409 });
        }

        // Default to a generic server error for any other issue
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}