/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Era-specific colors (starting with Tribal)
        tribal: {
          50: '#f5f0e8',
          100: '#e8e0d0',
          200: '#d4c0a0',
          300: '#c0a070',
          400: '#a08040',
          500: '#806020',
          600: '#604010',
          700: '#403008',
          800: '#302005',
          900: '#201003',
        },
      },
    },
  },
  plugins: [],
}
