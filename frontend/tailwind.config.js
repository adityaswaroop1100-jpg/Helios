/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        solar: {
          dark: '#0B132B',
          navy: '#1C2541',
          blue: '#3A506B',
          accent: '#00F0FF',
          yellow: '#FFB800',
          orange: '#FF5722',
          card: '#131C38',
          border: '#243256'
        }
      }
    },
  },
  plugins: [],
}
