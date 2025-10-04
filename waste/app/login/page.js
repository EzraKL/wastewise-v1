// app/login/page.js

'use client'; // Required because we are using React Hooks

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // IMPORTANT: New router location for App Router
import Head from 'next/head'; // Head is generally used in Layouts in App Router, but kept for simplicity here
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { status } = useSession(); 

  // --- Conditional Redirect Check ---
  // Note: Using router.replace() is often better than router.push() for redirects to clear history
  if (status === 'authenticated') {
    router.replace('/dashboard'); // Redirect authenticated users away from login page
    return null; 
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Call NextAuth's signIn function
    const result = await signIn('credentials', {
      redirect: false,
      email: email,
      password: password,
    });

    if (result.error) {
      // Display generic security error
      setError('Login failed: Invalid email or password.'); 
    } else {
      // On success, redirect to the secure dashboard
      router.replace('/dashboard'); 
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Head><title>WasteWise - Login</title></Head>
      <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-green-700">Login to WasteWise</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              placeholder="business.email@company.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 transition duration-150"
          >
            Sign In
          </button>
          
          <p className="text-center text-sm text-gray-600">
            Need an account? 
            <Link href="/register">
              <span className="text-green-600 hover:text-green-700 font-medium ml-1 cursor-pointer">Register Your Business</span>
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}