/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // TypeScript ve React dosyalarını kapsar
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'neon-green': '#00ff00',
        'neon-blue': '#00b7eb',
      },
      fontFamily: {
        vt323: ['VT323', 'monospace'],
      },
      animation: {
        'matrix-rain': 'matrixRain 10s linear infinite',
        'matrix-type': 'matrixType 1.5s steps(20) forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        matrixRain: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
        matrixType: {
          '0%': { clipPath: 'inset(0 100% 0 0)', opacity: '0.7' },
          '100%': { clipPath: 'inset(0 0 0 0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};