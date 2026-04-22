/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0e17",
          secondary: "#111827",
          card: "rgba(17,24,39,0.6)",
        },
        accent: {
          DEFAULT: "#06d6a0",
          light: "#34ebc0",
          dark: "#059d79",
          warm: "#8338ec",
        },
        gold: { DEFAULT: "#06d6a0", light: "#34ebc0", dark: "#059d79" },
        amber: "#f59e0b",
        emerald: "#06d6a0",
        wizard: {
          purple: "#8338ec",
          "purple-light": "#a56ef5",
          "purple-dark": "#6b21a8",
        },
        neon: {
          cyan: "#06d6a0",
          violet: "#8338ec",
          pink: "#ec4899",
        },
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
        brand: ["Space Grotesk", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.45s ease forwards",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        shimmer: "shimmer 4s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        shimmer: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
        "card-hover": "0 12px 48px rgba(0,0,0,0.4), 0 0 30px rgba(6,214,160,0.08)",
        accent: "0 0 20px rgba(6,214,160,0.3)",
        "accent-lg": "0 0 40px rgba(6,214,160,0.5)",
        neon: "0 0 20px rgba(6,214,160,0.3), 0 4px 16px rgba(6,214,160,0.2)",
        "neon-lg": "0 0 40px rgba(6,214,160,0.5), 0 8px 32px rgba(6,214,160,0.3)",
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
