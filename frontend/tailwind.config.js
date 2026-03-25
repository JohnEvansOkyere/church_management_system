/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#dceeff',
          600: '#1769aa',
          700: '#0f4f82',
          800: '#0a3a5f',
        },
      },
    },
  },
  plugins: [],
};
