/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          navy: "#0F2942",
          navyDark: "#0B1E36",
          navyLight: "#1E3A5F",
          accent: "#2563EB",
          slate: "#F1F5F9",
          border: "#E2E8F0",
          verified: "#059669",
          verifiedBg: "#ECFDF5",
          verifiedBorder: "#A7F3D0",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
