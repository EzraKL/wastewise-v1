// pages/index.js - THE CRITICAL HOMEPAGE FILE (FINAL CORRECTED LINKS)

import Head from 'next/head'; 
import Link from 'next/link';

// Component for the Value Proposition Cards (Uses professional icon placeholders)
const ValueCard = ({ title, description, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500 hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
    <div className="text-4xl text-green-600 mb-4 font-extrabold">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

export default function HomePage() {
  return (
    <>
      <Head>
        <title>WasteWise Exchange - B2B Circular Economy Marketplace</title>
      </Head>

      {/* --- SECTION 1: HERO (The Hook) --- */}
      <header className="bg-gray-100 py-20 text-center border-b border-gray-200">
        <div className="container mx-auto px-4">
          <h1 className="text-6xl font-extrabold text-gray-900 mb-4">
            WasteWise Exchange
          </h1>
          <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The B2B Platform Turning Industrial Waste Into <b>Direct, Quantifiable Revenue</b>.
          </p>
          
          {/* Main Call to Action */}
          <div className="space-y-4 sm:space-y-0 sm:space-x-6 sm:flex sm:justify-center">
            
            {/* FIX 1: Browse Marketplace Link */}
            <Link 
              href="/listings" 
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
            >
              Browse Marketplace →
            </Link>
            
            {/* FIX 2: Register Button Link */}
            <Link 
              href="/register" 
              className="inline-block bg-transparent border-2 border-green-600 text-green-700 hover:bg-green-50 font-bold py-3 px-8 rounded-lg transition duration-300"
            >
              Register Your Business
            </Link>
          </div>
        </div>
      </header>
      {/* ---------------------------------------------------------------------------------- */}

      {/* --- SECTION 2: VALUE PROPOSITION (The Economic Drivers) --- */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Why Choose WasteWise?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueCard 
              icon="Ksh" 
              title="Maximize Profitability"
              description="Transform disposal costs into new profit centers. Secure better prices for your by-products by accessing a wide network of verified buyers."
            />
            <ValueCard 
              icon="🔒" 
              title="Guaranteed Trust (Escrow)"
              description="Transact with total confidence. Our integrated escrow system holds funds until the Buyer confirms receipt, guaranteeing payment for every sale."
            />
            <ValueCard 
              icon="⚖️" 
              title="Regulatory Alignment"
              description="Ensure compliance with Kenya's SWM Act (2022). Easily track material recovery metrics and align with corporate ESG targets."
            />
          </div>
        </div>
      </section>
      {/* ---------------------------------------------------------------------------------- */}

      {/* --- SECTION 3: HOW IT WORKS (The Process Flow) --- */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-12">The Simple, Secure Cycle</h2>
          
          <div className="flex justify-center space-x-4 md:space-x-12">
            
            {/* Step 1: LISTING */}
            <div className="w-1/4">
              <div className="flex items-center justify-center h-16 w-16 mx-auto mb-3 bg-green-200 text-green-800 rounded-full text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-1">List & Verify</h3>
              <p className="text-gray-600 text-sm">Seller posts material with standardized quality metrics.</p>
            </div>
            
            {/* Divider: Arrow Icon */}
            <div className="flex items-center justify-center w-1/12 text-3xl text-gray-400 hidden md:flex">→</div> 

            {/* Step 2: OFFER */}
            <div className="w-1/4">
              <div className="flex items-center justify-center h-16 w-16 mx-auto mb-3 bg-yellow-200 text-yellow-800 rounded-full text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-1">Fund Escrow</h3>
              <p className="text-gray-600 text-sm">Buyer submits offer and secures full payment in escrow.</p>
            </div>
            
            {/* Divider: Arrow Icon */}
            <div className="flex items-center justify-center w-1/12 text-3xl text-gray-400 hidden md:flex">→</div> 

            {/* Step 3: FULFILLMENT */}
            <div className="w-1/4">
              <div className="flex items-center justify-center h-16 w-16 mx-auto mb-3 bg-blue-200 text-blue-800 rounded-full text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-1">Confirm & Close</h3>
              <p className="text-gray-600 text-sm">Material is delivered; Buyer confirms receipt, releasing payment to Seller.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}