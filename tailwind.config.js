/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './App.tsx'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Roboto Slab"', 'serif'],
      },
      colors: {
        cream: {
          50: '#f5f5f0',
          100: '#f5f5f0',
        },
        sand: {
          100: '#e6d8c3',
          200: '#e6d8c3',
        },
        tan: {
          400: '#c2a68c',
          500: '#c2a68c',
        },
        sage: {
          600: '#5d866c',
          700: '#4a6b57',
          800: '#3d5949',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
    },
  },
  plugins: [],
};
