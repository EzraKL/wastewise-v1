// app/api/auth/[...nextauth]/route.js

import NextAuth from 'next-auth';
// CRITICAL: Since your authOptions is outside the API folder, 
// you must update this import path if you haven't already:
import { authOptions } from '@/lib/auth'; 

const handler = NextAuth(authOptions);

// Next.js App Router requires named exports for Route Handlers
export { handler as GET, handler as POST };