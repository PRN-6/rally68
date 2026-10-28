/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rally: {
          red: '#d32f2f',
          orange: '#ef6c00',
          dark: '#1a1a1a',
          dirt: '#8b7355',
        }
      },
      fontFamily: {
        racing: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
