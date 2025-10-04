// app/api/dashboard/my-transactions/route.js (FIXED getServerSession CALL)

import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server'; 

export async function GET(request) {
    
    // CRITICAL FIX: Pass ONLY authOptions. The function finds req/res automatically.
    const session = await getServerSession(authOptions); 
    
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    await dbConnect();

    try {
        const userId = session.user.id;

        // Query Logic: Use $or to fetch transactions where the user is EITHER the Buyer OR the Seller
        const transactions = await Transaction.find({
            $or: [
                { buyerId: userId },
                { sellerId: userId }
            ]
        })
        .populate('listingId', 'title materialType unit') 
        .sort({ createdAt: -1 })
        .limit(50);
        
        // Success Response
        return NextResponse.json({ 
            success: true, 
            data: transactions,
            count: transactions.length,
        }, { status: 200 });

    } catch (error) {
        console.error('Get Transactions API Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}