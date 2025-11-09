/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6900',
        secondary: '#1E293B',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}