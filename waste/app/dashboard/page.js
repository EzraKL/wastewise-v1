// app/dashboard/page.js
'use client'; // CRITICAL: Required for hooks (useState, useSession, useRouter)

import Head from 'next/head';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // *** MIGRATION FIX: Use App Router's navigation ***
import { useState, useEffect } from 'react';

export default function DashboardPage() {
    // 1. ALL HOOKS MUST BE DECLARED UNCONDITIONALLY AT THE TOP
    const { data: session, status } = useSession();
    const router = useRouter();
    
    // Data for Seller's listings (Active/Pending)
    const [myListings, setMyListings] = useState([]); 
    // Data for ALL user transactions (Unified Log)
    const [transactions, setTransactions] = useState([]); 
    const [historyLoading, setHistoryLoading] = useState(true);
    
    // Safely define roles and IDs
    const currentUserId = session?.user?.id;
    const userRole = session?.user?.role;
    
    // Explicit Role Definitions
    const isSellerRole = userRole === 'Seller' || userRole === 'Both';
    const isBuyerRole = userRole === 'Buyer' || userRole === 'Both';
    
    // --- 2. DATA FETCHING EFFECT (UNIFIED FETCH) ---
    useEffect(() => {
        // Only proceed if the user is authenticated and their ID is available
        if (status !== 'authenticated' || !currentUserId) return;
        
        const fetchDashboardData = async () => {
            setHistoryLoading(true);
            
            // 1. FETCH ACTIVE LISTINGS (Only if user can sell)
            if (isSellerRole) {
                try {
                    const res = await fetch('/api/dashboard/my-listings'); 
                    const data = await res.json();
                    if (data.success) {
                        setMyListings(data.data); 
                    }
                } catch (e) {
                    console.error("Failed to fetch user listings:", e);
                }
            }
            
            // 2. FETCH UNIFIED Transaction History (For ALL roles)
            try {
                const res = await fetch('/api/dashboard/my-transactions'); 
                const data = await res.json();
                if (data.success) {
                    setTransactions(data.data); 
                }
            } catch (e) {
                console.error("Failed to fetch transactions:", e);
            } finally {
                setHistoryLoading(false);
            }
        };
        fetchDashboardData();
        
    }, [status, currentUserId, isSellerRole]); 
    // --- END Data Fetching ---

    // 3. CONDITIONAL EARLY EXITS (Placed AFTER all hooks)
    if (status === 'loading') {
        return <div className="text-center p-16">Loading authentication...</div>;
    }
    if (status === 'unauthenticated') {
        // Fix: Use router.replace to avoid piling up login attempts in history
        router.replace('/login'); 
        return null; 
    }
    
    // FILTERING LOGIC (Applied just before rendering)
    const activeListings = myListings.filter(l => l.status === 'Active');
    const completedPurchases = transactions.filter(tx => 
        tx.buyerId.toString() === currentUserId && tx.status === 'COMPLETED'
    );
    
    // --- RENDER CONTENT ---
    return (
        <div className="container mx-auto p-4">
            <Head><title>WasteWise - {userRole} Dashboard</title></Head>

            <div className="bg-white shadow-lg rounded-xl p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back, {session.user.email}</h1>
                <p className={`text-sm font-medium mb-6 ${isSellerRole ? 'text-green-600' : 'text-blue-600'}`}>
                    Role: {userRole}
                </p>

                {/* --- Action Cards Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* ACTION CARD 1: Browse Marketplace */}
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-blue-800 mb-2">Browse Marketplace</h2>
                            <p className="text-sm text-gray-600">See all active materials from other businesses.</p>
                        </div>
                        {/* FIX: Modern Link structure (removes redundant button tag) */}
                        <Link 
                            href="/listings" 
                            className="mt-4 w-full py-2 text-center rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
                        >
                            View Public Listings
                        </Link>
                    </div>

                    {/* ACTION CARD 2: Transaction History */}
                    <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Transaction History</h2>
                            <p className="text-sm text-gray-600">Manage all offers, deliveries, and fund releases.</p>
                        </div>
                        {/* FIX: Modern Link structure */}
                        <Link 
                            href="/dashboard/transactions" 
                            className="mt-4 w-full py-2 text-center rounded-md text-white bg-yellow-600 hover:bg-yellow-700 transition"
                        >
                            Go to Unified Deals
                        </Link>
                    </div>
                    
                    {/* ACTION CARD 3: Create Listing (Seller/Both access) */}
                    {isSellerRole && (
                        <div className="bg-green-50 p-6 rounded-lg border border-green-200 flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-green-800 mb-2">Post New Listing</h2>
                                <p className="text-sm text-gray-600">Turn your waste inventory into revenue instantly.</p>
                            </div>
                            {/* FIX: Modern Link structure */}
                            <Link 
                                href="/dashboard/create-listing" 
                                className="mt-4 w-full py-2 text-center rounded-md text-white bg-green-600 hover:bg-green-700 transition"
                            >
                                Create Listing
                            </Link>
                        </div>
                    )}
                </div>

                {/* --- History Panels (Side-by-Side) --- */}
                <div className="mt-10 pt-8 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* 1. SELLER'S LISTING HISTORY (LEFT SIDE) - Displays Active Listings */}
                    {isSellerRole && (
                        <div className="md:col-span-1">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Active Listings ({activeListings.length})</h2>
                            <p className="text-sm text-gray-500 mb-4">Last 5 materials currently for sale.</p>
                            
                            {historyLoading && <p className="text-center text-gray-500">Loading sales history...</p>}
                            
                            <div className="space-y-4">
                                {activeListings.slice(0, 5).map(listing => (
                                    <div key={listing._id} className="flex justify-between items-center p-4 rounded-lg shadow-sm border border-green-300">
                                        <div>
                                            <p className="font-semibold text-lg">{listing.title}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-700">ACTIVE</p>
                                            <p className="text-sm">Ksh {listing.pricePerUnit.toLocaleString()} / {listing.unit}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link href="/dashboard/transactions" passHref>
                                <p className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer mt-4">
                                    View All Sales & Offers »
                                </p>
                            </Link>
                        </div>
                    )}


                    {/* 2. BUYER'S PURCHASE HISTORY (RIGHT SIDE) - Displays Completed Purchases */}
                    {isBuyerRole && (
                        <div className="md:col-span-1">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Purchases ({completedPurchases.length} Completed)</h2>
                            <p className="text-sm text-gray-500 mb-4">Last 5 materials you successfully acquired.</p>
                            
                            {historyLoading && <p className="text-center text-gray-500">Loading purchase history...</p>}
                            
                            <div className="space-y-4">
                                {completedPurchases.slice(0, 5).map(tx => (
                                    <div key={tx._id} className="flex justify-between items-center p-4 rounded-lg shadow-sm border border-blue-300 bg-blue-50">
                                        <div>
                                            {/* Note: listingId.title is safely accessed from the populated transaction */}
                                            <p className="font-semibold text-lg truncate">{tx.listingId?.title || 'Unknown Listing'}</p> 
                                            <p className="text-sm text-gray-500">Acquired: {new Date(tx.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-blue-700">ACQUIRED</p>
                                            <p className="text-sm">Ksh {tx.agreedPrice.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <Link href="/dashboard/transactions" passHref>
                                <p className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer mt-4">
                                    Manage Pending Deliveries »
                                </p>
                            </Link>
                        </div>
                    )}
                </div>
                {/* --- END History Panels --- */}
                
                {/* Sign Out Button at the very bottom */}
                <div className="mt-8 border-t pt-4 flex justify-end">
                    <button onClick={() => signOut()} className="py-2 px-4 text-sm bg-gray-100 text-red-600 rounded-md hover:bg-gray-200 transition">
                        Secure Sign Out
                    </button>
                </div>

            </div>
        </div>
    );
}