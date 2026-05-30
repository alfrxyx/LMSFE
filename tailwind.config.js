/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      keyframes: {
        'xp-float': {
          '0%': { transform: 'translate(-50%, 0) scale(0.5)', opacity: '0' },
          '20%': { transform: 'translate(-50%, -100px) scale(1.2)', opacity: '1' },
          '80%': { transform: 'translate(-50%, -120px) scale(1)', opacity: '1' },
          '100%': { transform: 'translate(-50%, -200px) scale(0.8)', opacity: '0' },
        }
      },
      animation: {
        'xp-float': 'xp-float 2s ease-out forwards',
      }
    },
  },
  plugins: [],
};
