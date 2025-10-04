// lib/auth.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from './dbConnect';
import User from '../models/User';

export const authOptions = {
  session: {
    strategy: 'jwt', // Use JWTs for stateless sessions (ideal for Vercel/Next.js)
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      async authorize(credentials) {
        await dbConnect();
        const { email, password } = credentials;

        const user = await User.findOne({ email });
        if (!user) {
          // Return null on failure: tells NextAuth authentication failed
          return null; 
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return null; 
        }

        // Return a minimal user object on success
        return { id: user._id.toString(), email: user.email, role: user.role };
      },
    }),
  ],
  // Define callbacks to include custom data (like 'role') in the session/JWT
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // Redirects users to your custom login page
  },
  // You must generate a strong secret key and add it to Vercel/env file
  secret: process.env.NEXTAUTH_SECRET, 
};

export default NextAuth(authOptions);