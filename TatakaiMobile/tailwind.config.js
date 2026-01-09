/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        primary: "#6366f1",
        secondary: "#a78bfa",
        accent: "#818cf8",
        muted: "#27272a",
        border: "rgba(255, 255, 255, 0.08)",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}

