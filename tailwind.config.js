/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EFE9DD",
        ink: "#2C2825",
        accent: "#1E3A5F",
        muted: "#8A8580",
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        sans: ['"DM Sans"', '"Inter"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        field: "6px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(44, 40, 37, 0.06), 0 1px 2px rgba(44, 40, 37, 0.04)",
      },
    },
  },
  plugins: [],
};
