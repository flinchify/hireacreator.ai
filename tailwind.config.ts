import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        hero: ["Inter Tight", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#dbe4ff",
          200: "#bac8ff",
          300: "#91a7ff",
          400: "#748ffc",
          500: "#5c7cfa",
          600: "#4c6ef5",
          700: "#4263eb",
          800: "#3b5bdb",
          900: "#364fc7",
          950: "#1e3a8a",
        },
      },
      maxWidth: {
        "8xl": "88rem",
      },
      animation: {
        "ticker-left": "ticker-left 40s linear infinite",
        "ticker-right": "ticker-right 40s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "glow-border": "glow-border 4s linear infinite",
        "badge-float": "badge-float 5s ease-in-out infinite",
        "badge-float-alt": "badge-float-alt 6s ease-in-out infinite",
        "aurora": "aurora 8s ease-in-out infinite",
        "aurora-2": "aurora 12s ease-in-out 2s infinite",
        "aurora-3": "aurora 10s ease-in-out 4s infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "particle-1": "particle 12s linear infinite",
        "particle-2": "particle 16s linear 4s infinite",
        "particle-3": "particle 20s linear 8s infinite",
      },
      keyframes: {
        "ticker-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "ticker-right": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "glow-border": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "badge-float": {
          "0%, 100%": { transform: "translateY(0) rotate(-1deg)" },
          "50%": { transform: "translateY(-8px) rotate(1deg)" },
        },
        "badge-float-alt": {
          "0%, 100%": { transform: "translateY(0) rotate(1deg)" },
          "50%": { transform: "translateY(-10px) rotate(-1deg)" },
        },
        "aurora": {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -20px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0, 0) scale(1)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "particle": {
          "0%": { transform: "translateY(100vh) translateX(0)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(-10vh) translateX(100px)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
