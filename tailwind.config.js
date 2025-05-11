// tailwind.config.js
const colors = require('tailwindcss/colors');

module.exports = {
  darkMode: 'class', // required to use `dark:` variants
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        'soft-bg': '#999',       // softer dark background
        'soft-surface': '#555',  // card background
        'soft-text': '#e5e7eb',     // main text
        'soft-muted': '#9ca3af',    // muted subtext
        'soft-border': '#4b5563',   // borders
      },
    },
  },
  plugins: [],
};
