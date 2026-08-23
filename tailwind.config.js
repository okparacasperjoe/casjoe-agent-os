/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        casjoe: {
          bg: '#060913',
          sidebar: '#070B15',
          card: '#0C1222',
          gold: '#FF9F00',
          orange: '#FF6B00'
        }
      }
    }
  },
  plugins: [],
}
