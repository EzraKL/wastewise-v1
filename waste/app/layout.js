// app/layout.js (STYLED VERSION)

import './globals.css'; // Your global Tailwind CSS imports
import SessionProviderWrapper from '@/components/SessionProviderWrapper'; // Import the provider component
import Link from 'next/link'; // Import Link for navigation

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Apply a background color and ensure a flexible layout for min-height screen */}
      <body className="bg-gray-100 min-h-screen flex flex-col">
        <SessionProviderWrapper>
            
          {/* --- Global Header/Navigation --- */}
          <header className="bg-white shadow-md sticky top-0 z-10 border-b border-gray-200">
            <div className="container mx-auto p-4 flex justify-between items-center">
              
              {/* Logo/Site Name (Linked to Homepage) */}
              <Link href="/" passHref>
                <span className="text-2xl font-extrabold text-green-700 hover:text-green-800 transition duration-150 cursor-pointer">
                  WasteWise Exchange
                </span>
              </Link>
              
              {/* Placeholder for Auth Buttons/Links */}
              <nav className="space-x-4 text-sm font-medium text-gray-700">
                <Link href="/listings" passHref>
                  <span className="font-extrabold text-green-700 hover:text-green-800  cursor-pointer">Marketplace</span>
                </Link>
                <Link href="/dashboard" passHref>
                  <span className="font-extrabold text-green-700 hover:text-green-800 cursor-pointer">Dashboard</span>
                </Link>
              </nav>

            </div>
          </header>
          
          {/* --- Main Content Area (Takes up remaining height) --- */}
          <main className="flex-grow container mx-auto p-4 md:p-6">
            {children}
          </main>

          {/* --- Footer --- */}
          <footer className="bg-gray-200 py-4 text-center text-xs text-gray-600 border-t border-gray-300">
            <div className="container mx-auto px-4">
              © {new Date().getFullYear()} WasteWise Exchange. Driving a Circular Economy in Kenya and Beyond.
            </div>
          </footer>

        </SessionProviderWrapper>
      </body>
    </html>
  );
}