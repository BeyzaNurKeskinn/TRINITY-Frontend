/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "neon-green": "#00ff00",
        "neon-blue": "#00b7eb",
        "neon-red": "#ff0033",
        "pastel-blue": "#bfdbfe",
        "pastel-pink": "#f9a8d4",
        "pastel-purple": "#c4b5fd",
        "gradient-blue": "#3b82f6",
        "gradient-pink": "#ec4899",
        "gradient-purple": "#8b5cf6",
      },
      fontFamily: {
        vt323: ["VT323", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        "matrix-rain": "matrixRain 10s linear infinite",
        "matrix-type": "matrixType 1.5s steps(20) forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "fade-inn": "fadeIn 0.5s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        matrixRain: {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "0% 100%" },
        },
        matrixType: {
          "0%": { clipPath: "inset(0 100% 0 0)", opacity: "0.7" },
          "100%": { clipPath: "inset(0 0 0 0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(0, 183, 235, 0.4)" }, // Neon mavi glow
          "50%": { boxShadow: "0 0 12px rgba(0, 183, 235, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};