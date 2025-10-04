// postcss.config.js (Corrected for Tailwind v4+)
module.exports = {
    plugins: {
      // Correctly reference the new package for Tailwind functionality
      '@tailwindcss/postcss': {}, 
      'autoprefixer': {},
    },
  }