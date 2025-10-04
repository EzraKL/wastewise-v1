// pages/_app.js

import { SessionProvider } from 'next-auth/react';
// 💥 CRITICAL: This line injects the entire Tailwind CSS framework into your app.
import '../styles/globals.css'; 

function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;