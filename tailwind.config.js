/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xbrl: {
          navy: '#071b36',
          dark: '#0d2240',
          blue: '#145ca8',
          cyan: '#12cbe6',
          surface: '#f7f9fc',
          card: '#ffffff',
          border: '#dee4ed',
          slate: '#475569',
        }
      }
    },
  },
  plugins: [],
}
