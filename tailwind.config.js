/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E90FF',
        secondary: '#FFA500',
        accent: '#FFD700',
        teal: '#00CED1',
        aqua: '#7FFFD4',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'fadeIn': 'fadeIn 0.5s ease-in',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

