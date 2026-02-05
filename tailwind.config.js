/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["\"DM Serif Display\"", "serif"],
        sans: ["\"Space Grotesk\"", "system-ui", "sans-serif"],
        cinzel: ["Cinzel", "serif"],
        courier: ["\"Courier Prime\"", "monospace"],
        dancing: ["\"Dancing Script\"", "cursive"],
        playfair: ["\"Playfair Display\"", "serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-18px)" },
        },
        pulseSoft: {
          "0%, 100%": { transform: "rotate(45deg) scale(1)" },
          "50%": { transform: "rotate(45deg) scale(1.08)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "220px 220px" },
        },
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(18px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 12s ease-in-out infinite",
        pulseSoft: "pulseSoft 2.6s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
        fadeUp: "fadeUp 0.8s ease",
      },
      boxShadow: {
        glow: "0 20px 60px rgba(214, 86, 120, 0.25)",
      },
      borderRadius: {
        card: "28px",
      },
      colors: {
        blush: {
          50: "#fff3f7",
          100: "#fce6ef",
          200: "#f7b7c9",
          400: "#ff9ebb",
          500: "#ff5a8a",
        },
        retro: {
          100: "#ffe29f",
          300: "#ffb347",
          500: "#ff5f2e",
          600: "#e24a1d",
        },
      },
    },
  },
  plugins: [],
};
