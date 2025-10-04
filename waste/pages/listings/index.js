import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react'; 
import Head from 'next/head'; 
import Link from 'next/link';
import { useRouter } from 'next/router'; 

export default function ListingsPage() {
  const { data: session, status } = useSession(); 
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Safely get the current user's ID for comparison
  const currentUserId = session?.user?.id; 
  const isUserAuthenticated = status === 'authenticated';

  // --- Data Fetching Logic ---
  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Fetch data from the public API endpoint (now includes sellerId for frontend check)
        const res = await fetch('/api/listings'); 
        const data = await res.json();
        if (data.success) {
          setListings(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);
  // ---------------------------

  // --- Transactional Logic Modification ---
  const handleTransactionalClick = (listingId) => {
    if (!isUserAuthenticated) {
      // Redirect unauthenticated users to the login page
      router.push('/login'); 
    } else {
      // Authenticated: Redirect to the offer page with the dynamic ID
      router.push(`/offer?listingId=${listingId}`); 
    }
  };
  // ----------------------------------------

  const renderAuthButton = () => {
    if (status === 'loading') {
      return <div className="text-gray-500">Checking Auth...</div>;
    }
    if (isUserAuthenticated) {
      return (
        <button 
          onClick={() => signOut()} 
          className="text-red-500 hover:text-red-700 transition duration-150"
        >
          Sign Out ({session.user.role})
        </button>
      );
    }
    return (
      <Link href="/login" passHref>
        <span className="text-green-600 hover:text-green-700 font-medium cursor-pointer">
          Sign In
        </span>
      </Link>
    );
  };


  if (loading) {
    return <div className="text-center p-8 text-lg font-medium text-gray-700">Loading WasteWise Marketplace...</div>;
  }
  

  return (
    <div className="container mx-auto p-4">
      <Head><title>WasteWise Marketplace - Active Listings</title></Head>
      
      {/* Header/Nav Bar Simulation */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <Link href="/" passHref><h1 className="text-2xl font-extrabold text-gray-800 cursor-pointer">WasteWise Exchange</h1></Link>
        <div className="flex items-center space-x-4">
            {renderAuthButton()}
            {isUserAuthenticated && (
                <Link href="/dashboard" passHref>
                    <span className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
                        Dashboard
                    </span>
                </Link>
            )}
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-6 text-gray-700">Active Listings ({listings.length})</h2>

      {/* Main Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {listings.map((listing) => {
          // CRITICAL LOGIC: Check for self-transaction and set button state
          const isOwnListing = isUserAuthenticated && (listing.sellerId === currentUserId);
          
          const buttonContent = isUserAuthenticated 
            ? isOwnListing ? 'YOUR LISTING' : 'MAKE SECURE OFFER'
            : 'LOG IN TO TRANSACT';
          
          const buttonClass = isOwnListing
            ? 'bg-yellow-500 text-gray-800 cursor-not-allowed' // Highlight the user's own listing
            : isUserAuthenticated 
              ? 'bg-green-600 hover:bg-green-700 text-white' // Standard buy button
              : 'bg-gray-300 text-gray-600 cursor-not-allowed'; // Log in button

          return (
            <div key={listing._id} className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-green-600 transition hover:shadow-xl">
              {/* Listing Details */}
              <h3 className="text-xl font-semibold mb-2 truncate">{listing.title}</h3>
              <p className="text-gray-500 text-sm mb-4">Material: {listing.materialType}</p>
              
              <p className="text-2xl font-extrabold text-green-700 mb-2">Ksh {listing.pricePerUnit.toLocaleString()}</p>
              <p className="text-sm text-gray-700">Quantity: {listing.quantity} {listing.unit}</p>
              <p className="text-xs text-gray-400 mt-1">Location: {listing.locationName}</p>

              <button
                // Pass listingId only if the user is not the owner
                onClick={() => !isOwnListing && handleTransactionalClick(listing._id)} 
                disabled={status === 'loading' || isOwnListing} // Disable if loading or if owned
                className={`mt-4 w-full py-2 rounded-lg font-medium transition duration-150 ${buttonClass} text-sm`}
              >
                {buttonContent}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}