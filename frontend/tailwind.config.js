/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Cobalt Blue — primary swirl arc in Living Springs logo
        brand: {
          50:  '#EEF4FC',
          100: '#D5E6F9',
          200: '#A8CCEE',
          600: '#1E5BB5',
          700: '#1A4FA0',
          800: '#153F80',
          900: '#0E2B58',
        },
        // Crimson Red — lower swirl arc + "Living Springs" wordmark
        accent: {
          50:  '#FEF2F0',
          100: '#FDDBD7',
          600: '#D42A1A',
          700: '#C02416',
          800: '#9A1C10',
        },
        // Amber Orange — right swirl arc in logo
        church: {
          50:  '#FFF8EE',
          100: '#FFE9C4',
          600: '#D06A14',
          700: '#E07218',
          800: '#B85B12',
        },
        // Semantic success green
        success: {
          50:  '#F0FDF4',
          100: '#DCFCE7',
          700: '#15803D',
          800: '#166534',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
