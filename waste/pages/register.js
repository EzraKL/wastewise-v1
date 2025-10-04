// pages/register.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    kraPin: '',
    role: 'Both', // Default to Both
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        // Use the custom error message from the API (409 Conflict, 400 Bad Request)
        setError(data.message || 'Registration failed due to server error.');
        return;
      }

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      setError('A network error occurred. Please try again.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Head><title>WasteWise - Register Business</title></Head>
      <div className="w-full max-w-lg p-8 bg-white shadow-xl rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-green-700">Register Your Business</h1>
        <p className="text-sm text-center text-gray-500 mb-6">Start turning waste into revenue by joining the network.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(error || success) && (
            <p className={`p-3 rounded-md text-sm ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {error || success}
            </p>
          )}

          <input type="hidden" name="role" value="Seller" />

          {/* Company Name */}
          <label className="block text-sm font-medium text-gray-700">Company Name</label>
          <input name="companyName" onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md" />

          {/* KRA PIN (B2B Requirement) */}
          <label className="block text-sm font-medium text-gray-700">KRA PIN (For Verification)</label>
          <input name="kraPin" onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md" placeholder="e.g., P001234567A" />

          {/* Email */}
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input type="email" name="email" onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md" />

          {/* Password */}
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" name="password" onChange={handleChange} required minLength="8" className="w-full p-3 border border-gray-300 rounded-md" />

          <button type="submit" className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 transition duration-150">
            Register & Get Started
          </button>
          
          <p className="text-center text-sm text-gray-600">
            Already registered? 
            <Link href="/login" passHref>
              <span className="text-blue-600 hover:underline cursor-pointer ml-1">Sign In</span>
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}