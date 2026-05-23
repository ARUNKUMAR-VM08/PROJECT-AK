/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF5F5',
          100: '#FFE5E5',
          200: '#FFD0D0',
          300: '#FFA4A4',
          400: '#FF7D7D',
          500: '#FF5E5E', // Primary Coral Rose
          600: '#E04A4A',
          700: '#C23838',
          800: '#A42828',
          900: '#861B1B',
        },
        pastel: {
          rose: '#F8C8C0', // Soft Rose Gold accent
          pink: '#FFF3F3',  // Page Background / Light card background
          cream: '#FFFDF9', // Alternate warm white
          sage: '#F3F6F3',  // Cool natural tone
          peach: '#FFF8F2', // Warm secondary background
          clay: '#EAD5C3',  // Earthy neutral
          gold: '#D4A373',  // Gold highlights
          navy: '#1D242B',  // Clean charcoal navy text
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(224, 164, 152, 0.12)',
        'premium': '0 10px 30px -5px rgba(224, 164, 152, 0.18)',
      }
    },
  },
  plugins: [],
}
