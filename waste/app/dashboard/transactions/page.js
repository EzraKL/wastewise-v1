'use client'; // CRITICAL: This page uses client-side hooks (useState, useEffect, useSession)

import Head from 'next/head';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // *** MIGRATION FIX: Use next/navigation ***
import { useState, useEffect } from 'react';

// Utility to map status to a color for the UI (kept outside component function)
const getStatusColor = (status) => {
    switch (status) {
        case 'PAID_TO_ESCROW': return 'bg-yellow-600';
        case 'DELIVERED': return 'bg-blue-600';
        case 'COMPLETED': return 'bg-green-600';
        case 'PENDING_PAYMENT': return 'bg-gray-500';
        default: return 'bg-red-600';
    }
};

export default function TransactionsPage() {
    // 1. ALL HOOKS MUST BE DECLARED UNCONDITIONALLY AT THE TOP
    const { data: session, status } = useSession(); 
    const router = useRouter(); // App Router useRouter
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Safely define user ID
    const currentUserId = session?.user?.id;
    
    // --- Data Fetching Function (Defined to be REUSABLE) ---
    const fetchTransactions = async (currentStatus) => {
        if (currentStatus !== 'authenticated') return; 

        try {
            // CRITICAL: Call the API route handler to get unified history
            const res = await fetch('/api/dashboard/my-transactions'); 
            const data = await res.json();
            
            if (data.success) {
                const userId = session.user.id;
                
                const processedData = data.data.map(tx => ({
                    ...tx,
                    role: tx.buyerId.toString() === userId ? 'Buyer' : 'Seller',
                    listingTitle: tx.listingId.title,
                    unit: tx.listingId.unit,
                }));
                setTransactions(processedData);
            }
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
        } finally {
            setLoading(false);
        }
    };
    // --- END Data Fetching Function ---

    // --- Fulfillment Action Handlers ---
    
    // Function to handle the final fund release by the BUYER
    const handleConfirmReceipt = async (transactionId) => {
        // NOTE: We replace confirm() with a visual modal in production apps
        if (!window.confirm("Are you sure you want to confirm receipt? This action releases the funds to the seller and cannot be undone.")) {
            return; 
        }

        try {
            const res = await fetch('/api/transactions/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId }),
            });

            if (res.ok) {
                window.alert("SUCCESS! Receipt confirmed and funds released.");
                // Force a full data re-fetch to update the screen status
                fetchTransactions('authenticated'); 
            } else {
                const data = await res.json();
                window.alert(`Error confirming receipt: ${data.message}`);
            }
        } catch (error) {
            window.alert("A network error occurred while confirming receipt.");
        }
    };
    
    // Function to handle the Seller marking the item as DELIVERED
    const handleMarkAsDelivered = async (transactionId) => {
        if (!window.confirm("Confirm material has been shipped/delivered? This updates the Buyer's view.")) {
            return;
        }

        try {
            const res = await fetch('/api/transactions/deliver', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId }),
            });

            if (res.ok) {
                window.alert("SUCCESS! Buyer has been notified the material is delivered and can now confirm receipt.");
                // Force a full data re-fetch to update the screen status
                fetchTransactions('authenticated'); 
            } else {
                 const data = await res.json();
                window.alert(`Error marking as delivered: ${data.message}`);
            }
        } catch (error) {
             window.alert("A network error occurred while updating status.");
        }
    };
    // --- END Fulfillment Action Handlers ---


    // --- Data Fetching Effect (Triggers on initial load) ---
    useEffect(() => {
        fetchTransactions(status);
    }, [status, session]); // Reruns when auth status changes


    // 2. CONDITIONAL EARLY EXITS (Placed AFTER all hooks)
    if (status === 'loading') {
        return <div className="text-center p-16">Loading authentication...</div>;
    }
    if (status === 'unauthenticated') {
        // Use router.replace for cleaner navigation history
        router.replace('/login');
        return null;
    }
    
    // --- RENDER CONTENT (Only runs if status is 'authenticated') ---
    if (loading) {
        return <div className="text-center p-16">Loading Transaction History...</div>;
    }
    
    return (
        <div className="container mx-auto p-4">
            <Head><title>Transaction History</title></Head>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Unified Transaction History</h1>
            <p className="mb-8 text-gray-600">Your current role: <span className='font-semibold'>{session.user.role}</span>. This view includes all deals as Buyer or Seller.</p>

            {transactions.length === 0 && <div className="text-center p-10 bg-gray-100 rounded-lg">No transactions found. Go browse the marketplace!</div>}

            <div className="space-y-4">
                {transactions.map(tx => (
                    <div key={tx._id} className="bg-white p-6 shadow-md rounded-lg flex justify-between items-center transition hover:shadow-xl">
                        <div className="flex-1">
                            {/* Listing Title is populated from the API call */}
                            <p className="text-xl font-semibold">{tx.listingTitle}</p> 
                            <p className="text-sm text-gray-500">
                                Deal: {tx.agreedQuantity} {tx.unit} @ Ksh {tx.agreedPrice.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-700 mt-2">
                                Role in Deal: <span className={`font-bold ${tx.role === 'Buyer' ? 'text-blue-600' : 'text-green-600'}`}>{tx.role}</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Transaction ID: {tx._id}</p>
                        </div>
                        <div className="text-right flex flex-col justify-center items-end">
                            <span className={`inline-block px-3 py-1 text-white text-xs font-semibold rounded-full mb-2 ${getStatusColor(tx.status)}`}>
                                {tx.status.replace('_', ' ')}
                            </span>
                            
                            {/* --- BUTTON LOGIC --- */}
                            
                            {/* 1. SELLER ACTION: Mark as Delivered (Visibility: Seller, Status: PAID_TO_ESCROW) */}
                            {tx.role === 'Seller' && tx.status === 'PAID_TO_ESCROW' && (
                                <button 
                                    onClick={() => handleMarkAsDelivered(tx._id)}
                                    className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 font-semibold transition"
                                >
                                    MARK AS DELIVERED
                                </button>
                            )}

                            {/* 2. BUYER ACTION: Confirm Receipt (Visibility: Buyer, Status: DELIVERED) */}
                            {tx.role === 'Buyer' && tx.status === 'DELIVERED' && (
                                <button 
                                    onClick={() => handleConfirmReceipt(tx._id)}
                                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 font-bold transition"
                                >
                                    CONFIRM RECEIPT (Release Funds)
                                </button>
                            )}
                            
                            {/* 3. Status Display for Completed */}
                            {tx.status === 'COMPLETED' && (
                                <p className="text-xs text-gray-500 mt-2">Closed {new Date(tx.updatedAt).toLocaleDateString()}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}