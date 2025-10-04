import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // 1. Authentication Check
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || !session.user.id) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    await dbConnect();

    try {
        const userId = session.user.id;

        // 2. Query Logic: Use $or to fetch transactions where the user is EITHER the Buyer OR the Seller
        const transactions = await Transaction.find({
            $or: [
                { buyerId: userId },
                { sellerId: userId }
            ]
        })
        // 3. CRITICAL: Use populate() to fetch listing details for display (Listing is the ref name in the Transaction model)
        .populate('listingId', 'title materialType unit') 
        .sort({ createdAt: -1 })
        .limit(50);
        
        // 4. Success Response
        res.status(200).json({
            success: true,
            data: transactions,
        });

    } catch (error) {
        console.error('Get Transactions API Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}