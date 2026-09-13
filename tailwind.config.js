/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Noto Sans SC", "system-ui", "sans-serif"],
        display: ["Fraunces", "serif"],
      },
      colors: {
        roseink: "#e11d74",
      },
    },
  },
  plugins: [],
};
