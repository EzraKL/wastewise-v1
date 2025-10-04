// app/api/auth/login/route.js

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
        const { email, password } = await readBody(request);

        // 1. Input Validation
        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email and password are required.' },
                { status: 400 }
            );
        }

        // 2. Find User
        const user = await User.findOne({ email });
        if (!user) {
            // Return a generic error (401 Unauthorized)
            return NextResponse.json(
                { message: 'Invalid credentials provided.' },
                { status: 401 }
            );
        }

        // 3. Compare Password (The core security step)
        // Ensure you have bcryptjs installed: npm install bcryptjs
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            // Generic error for incorrect password
            return NextResponse.json(
                { message: 'Invalid credentials provided.' },
                { status: 401 }
            );
        }

        // 4. Success Response
        // NOTE: The actual session creation is handled by NextAuth.js's 
        // CredentialsProvider authorize function, but this endpoint is useful 
        // for manual login testing and custom JWT flows.
        return NextResponse.json({
            success: true,
            message: 'Login successful! Session will be established.',
            data: {
                userId: user._id,
                email: user.email,
                role: user.role,
            },
        }, { status: 200 });

    } catch (error) {
        console.error('Login API Error:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}