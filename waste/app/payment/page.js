'use client'; 
// CRITICAL: Required for client-side hooks (useState, useRouter, useSession)

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Head from 'next/head';
import { useSession } from 'next-auth/react';

/* --------------------------
   Inner Component (Wrapped by Suspense)
--------------------------- */
function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('transactionId');
  const { status } = useSession();

  const [submitStatus, setSubmitStatus] = useState({
    message: '',
    loading: false,
    success: false,
  });

  // --- Loading / Session Validation ---
  if (status === 'loading')
    return <div className="text-center p-16">Loading...</div>;

  if (status === 'unauthenticated') {
    router.replace('/login');
    return null;
  }

  if (!transactionId) {
    return (
      <div className="text-center p-16 text-red-600">
        Error: No Transaction ID found. Please go back.
      </div>
    );
  }

  // --- Payment Simulation ---
  const handleSimulatePayment = async () => {
    setSubmitStatus({
      message: 'Contacting payment gateway...',
      loading: true,
      success: false,
    });

    try {
      const res = await fetch('/api/transactions/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitStatus({
          message: `Payment Failed: ${data.message || 'Server error occurred.'}`,
          loading: false,
          success: false,
        });
        return;
      }

      // Success case
      setSubmitStatus({
        message: '✅ SUCCESS! Funds secured in escrow. Redirecting to dashboard...',
        loading: true,
        success: true,
      });

      setTimeout(() => router.push('/dashboard/transactions'), 2000);
    } catch (error) {
      setSubmitStatus({
        message: 'A network error occurred. Please try again.',
        loading: false,
        success: false,
      });
    }
  };

  // --- Page Layout ---
  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <Head>
        <title>
          Secure Payment | {transactionId.substring(0, 8)}...
        </title>
      </Head>

      <div className="bg-white shadow-xl rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Secure Escrow Funding
        </h1>

        <p className="text-sm text-gray-600 mb-6">
          You are securing payment for Transaction ID:{' '}
          <strong>{transactionId}</strong>.
        </p>

        {submitStatus.message && (
          <p
            className={`p-3 rounded-md text-sm font-medium mb-4 ${
              submitStatus.success
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {submitStatus.message}
          </p>
        )}

        {/* Payment Gateway Simulation Area */}
        <div className="p-6 border-2 border-dashed border-blue-400 bg-blue-50 rounded-lg text-center">
          <p className="text-xl font-semibold text-blue-800">
            PAYMENT GATEWAY SIMULATION
          </p>
          <p className="text-sm text-gray-700 mt-2">
            Click below to simulate secure transfer of funds to the escrow account.
          </p>
        </div>

        <button
          onClick={handleSimulatePayment}
          disabled={submitStatus.loading}
          className="mt-6 py-3 px-8 bg-green-600 text-white rounded-md hover:bg-green-700 w-full disabled:bg-gray-400 transition-all"
        >
          {submitStatus.loading
            ? 'PROCESSING PAYMENT...'
            : 'SIMULATE PAYMENT SUCCESS (Fund Escrow)'}
        </button>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Funds will be held securely until you confirm material receipt.
        </p>
      </div>
    </div>
  );
}

/* --------------------------
   Outer Page with Suspense Wrapper
--------------------------- */
export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center">Loading payment details...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
