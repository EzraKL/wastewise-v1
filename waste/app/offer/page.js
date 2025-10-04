'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Head from 'next/head';
import { useSession } from 'next-auth/react';

function OfferPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId');

  const { data: session, status } = useSession();
  const [listing, setListing] = useState(null);
  const [formData, setFormData] = useState({ agreedQuantity: 0, agreedPrice: 0 });
  const [pageLoading, setPageLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState({ message: '', loading: false, success: false });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    if (!listingId) {
      setPageLoading(false);
      setSubmitStatus({ message: 'Error: Listing ID missing in URL.', loading: false, success: false });
      return;
    }

    const fetchListing = async () => {
      if (status === 'loading') return;

      try {
        const res = await fetch(`/api/listings/${listingId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          router.replace('/listings');
          return;
        }

        const fetched = data.data;
        setListing(fetched);
        setFormData({
          agreedQuantity: fetched.quantity,
          agreedPrice: fetched.pricePerUnit * fetched.quantity,
        });
      } catch (err) {
        setSubmitStatus({ message: 'Network error fetching listing data.', loading: false, success: false });
      } finally {
        setPageLoading(false);
      }
    };

    fetchListing();
  }, [listingId, status]);

  const handleQuantityChange = (e) => {
    const qty = parseFloat(e.target.value);

    if (listing && qty > 0 && qty <= listing.quantity) {
      setFormData({
        agreedQuantity: qty,
        agreedPrice: qty * listing.pricePerUnit,
      });
      setSubmitStatus({ message: '', loading: false, success: false });
    } else if (qty > listing?.quantity) {
      setFormData({
        ...formData,
        agreedQuantity: listing.quantity,
        agreedPrice: listing.quantity * listing.pricePerUnit,
      });
      setSubmitStatus({
        message: `Quantity limited to ${listing.quantity} ${listing.unit}.`,
        loading: false,
        success: false,
      });
    } else {
      setFormData({ ...formData, agreedQuantity: qty, agreedPrice: 0 });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ message: 'Submitting offer...', loading: true, success: false });

    if (formData.agreedQuantity <= 0) {
      setSubmitStatus({ message: 'Quantity must be greater than zero.', loading: false, success: false });
      return;
    }

    try {
      const payload = {
        listingId,
        agreedPrice: formData.agreedPrice,
        agreedQuantity: formData.agreedQuantity,
      };

      const res = await fetch('/api/transactions/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitStatus({ message: `Offer Failed: ${data.message || 'Server error.'}`, loading: false, success: false });
        return;
      }

      setSubmitStatus({ message: 'Offer secured! Redirecting to payment...', loading: true, success: true });

      setTimeout(() => {
        router.push(`/payment?transactionId=${data.data._id}`);
      }, 1500);
    } catch (err) {
      setSubmitStatus({ message: 'A network error occurred. Please try again.', loading: false, success: false });
    }
  };

  if (status === 'loading' || pageLoading)
    return <div className="text-center p-16">Loading Listing Details...</div>;

  if (!listing)
    return <div className="text-center p-16 bg-red-50 text-red-700">Listing unavailable or removed.</div>;

  const totalAmount = formData.agreedPrice.toLocaleString();
  const commissionRate = listing.materialType === 'PET Plastic' ? 0.08 : 0.05;
  const estimatedCommission = (formData.agreedPrice * commissionRate).toLocaleString();

  return (
    <div className="container mx-auto p-8 bg-gray-50">
      <Head><title>Secure Offer | {listing.title}</title></Head>

      <div className="bg-white shadow-xl rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Initiate Secure Offer</h1>

        <div className="border border-green-300 bg-green-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold text-green-800">{listing.title}</h2>
          <p className="text-sm text-gray-700 mt-1">Unit Price: Ksh {listing.pricePerUnit.toLocaleString()} per {listing.unit}</p>
          <p className="text-sm text-gray-700">Available: {listing.quantity} {listing.unit} in {listing.locationName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {submitStatus.message && (
            <p className={`p-3 rounded-md text-sm ${submitStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {submitStatus.message}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity to Purchase ({listing.unit})
              </label>
              <input
                type="number"
                name="agreedQuantity"
                value={formData.agreedQuantity}
                onChange={handleQuantityChange}
                min="1"
                max={listing.quantity}
                step="0.1"
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md text-lg focus:ring-blue-500"
                required
                disabled={submitStatus.loading}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Total (Ksh)</label>
              <div className="mt-1 w-full p-3 bg-gray-100 border border-gray-300 rounded-md flex justify-between items-center">
                <span className="text-2xl font-extrabold text-blue-600">Ksh {totalAmount}</span>
                <span className="text-sm font-medium text-gray-500">Commission: Ksh {estimatedCommission}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-md shadow-lg text-white bg-green-600 hover:bg-green-700 font-medium transition duration-150 flex items-center justify-center disabled:bg-gray-400"
            disabled={submitStatus.loading || formData.agreedQuantity <= 0}
          >
            {submitStatus.loading ? 'INITIATING ESCROW...' : 'CONFIRM OFFER & PROCEED TO PAYMENT'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ✅ Wrap OfferPageContent inside Suspense boundary
export default function OfferPage() {
  return (
    <Suspense fallback={<div className="text-center p-16">Loading offer page...</div>}>
      <OfferPageContent />
    </Suspense>
  );
}
