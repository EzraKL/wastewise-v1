// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      // This tells Tailwind to look in all your Next.js frontend files
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
      "./app/**/*.{js,ts,jsx,tsx}", // Include app directory for future use
    ],
    theme: {
      extend: {
        // Custom colors or fonts for the WasteWise brand can go here later
        colors: {
          'green-600': '#16a34a', // Primary brand color
          'green-700': '#15803d', 
        }
      },
    },
    plugins: [],
  }