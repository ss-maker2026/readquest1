import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#565E63",
        mist: "rgb(var(--mist-rgb) / <alpha-value>)",
        "glow-green": "rgb(var(--glow-green-rgb) / <alpha-value>)",
        "glow-gold": "rgb(var(--glow-gold-rgb) / <alpha-value>)",
        paper: "#EFF6FB",
        accent: {
          DEFAULT: "#7FA593",
          light: "#9DBEAF",
          soft: "#F0F5F2",
        },
        gold: {
          DEFAULT: "#C6AD87",
          soft: "#FAF3E8",
        },
      },
      fontFamily: {
        serif: ["var(--font-dot-gothic-16)", "sans-serif"],
        sans: [
          "var(--font-dot-gothic-16)",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-8px)", maxHeight: "0" },
          "100%": { opacity: "1", transform: "translateY(0)", maxHeight: "1000px" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
