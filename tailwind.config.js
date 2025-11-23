/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent': {
          'light': '#3b82f6', // A slightly lighter blue for hover states
          'DEFAULT': '#2563eb', // The default light blue accent
          'dark': '#1d4ed8', // A darker blue for active states
        },
      }
    },
  },
  plugins: [],
}
