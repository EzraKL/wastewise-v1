'use client'; // CRITICAL: Required because this component uses client-side hooks

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // *** MIGRATION FIX: New router location ***
import Head from 'next/head';
import Link from 'next/link'; // Still needed for the Link component

export default function CreateListingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '', materialType: 'PET Plastic', quantity: 1, unit: 'Tons', pricePerUnit: 0, locationName: ''
    });
    const [message, setMessage] = useState('');

    // Define allowed roles for posting
    const ALLOWED_ROLES = ['Seller', 'Both'];
    
    // Security Check: Redirect if not logged in or not an authorized Seller
    if (status === 'loading') return <div className="text-center p-16">Loading...</div>;
    
    // CRITICAL FIX: Ensure only Seller or Both roles can access the form
    if (status === 'unauthenticated' || !ALLOWED_ROLES.includes(session.user.role)) {
        router.push('/login');
        return null;
    }

    const handleChange = (e) => {
        // Ensure numbers are stored as numbers
        const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Submitting...');

        // Basic client-side validation check
        if (formData.pricePerUnit <= 0 || formData.quantity <= 0) {
            setMessage('Error: Price and Quantity must be greater than zero.');
            return;
        }

        try {
            // The API endpoint is now located at /app/api/listings/create/route.js
            const res = await fetch('/api/listings/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) {
                setMessage(`Error: ${data.message || 'Failed to create listing.'}`);
                return;
            }

            // --- SUCCESS: Redirect to Listings Page to view the new product ---
            setMessage(`Success! Listing created. Redirecting to the marketplace...`);
            setTimeout(() => {
                router.push('/listings'); // Redirect user to see their new listing instantly
            }, 1500);

        } catch (error) {
            setMessage('A network error occurred. Please try again.');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <Head><title>Post New Listing</title></Head>
            <div className="bg-white shadow-lg rounded-xl p-8">
                <h1 className="text-3xl font-bold text-green-700 mb-6">Post New Waste Material</h1>
                
                {/* Success/Error Message Display */}
                {message && <p className={`p-3 mb-4 rounded-md text-sm ${message.includes('Success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</p>}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Listing Title</label>
                        <input 
                            name="title" 
                            value={formData.title} 
                            onChange={handleChange} 
                            required 
                            placeholder="e.g., 5 Tons of Clean Scrap Metal" 
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-md" 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Material Type</label>
                        <select name="materialType" value={formData.materialType} onChange={handleChange} required className="mt-1 block w-full p-3 border border-gray-300 rounded-md">
                            <option>PET Plastic</option>
                            <option>LDPE Film</option>
                            <option>Scrap Metal (Ferrous)</option>
                            <option>Paper/Cardboard</option>
                            <option>Organic By-products</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price Per Unit (Ksh)</label>
                        <input type="number" name="pricePerUnit" value={formData.pricePerUnit} onChange={handleChange} required min="0" className="mt-1 block w-full p-3 border border-gray-300 rounded-md" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="1" className="mt-1 block w-full p-3 border border-gray-300 rounded-md" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Unit of Measure</label>
                        <select name="unit" value={formData.unit} onChange={handleChange} required className="mt-1 block w-full p-3 border border-gray-300 rounded-md">
                            <option>Tons</option>
                            <option>Kgs</option>
                            <option>Units</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">General Location (e.g., Nairobi Industrial Area)</label>
                        <input name="locationName" value={formData.locationName} onChange={handleChange} required className="mt-1 block w-full p-3 border border-gray-300 rounded-md" />
                    </div>

                    <div className="md:col-span-2 pt-4">
                        <button type="submit" className="w-full py-3 px-4 rounded-md shadow-lg text-white bg-green-600 hover:bg-green-700 font-medium transition duration-150">
                            Post Listing to Marketplace
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}