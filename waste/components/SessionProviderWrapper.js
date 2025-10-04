// components/SessionProviderWrapper.js
'use client'; 
// The "use client" directive is essential for this component to run in the browser.

import { SessionProvider } from 'next-auth/react';

export default function SessionProviderWrapper({ children }) {
  // We don't pass the 'session' prop here, as we are relying on NextAuth to fetch 
  // the session on the client side after login.
  return <SessionProvider>{children}</SessionProvider>;
}