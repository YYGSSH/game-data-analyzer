/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan all JS/JSX files in src for Tailwind classes
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb", // Blue
        success: "#16a34a", // Green
        danger: "#dc2626", // Red
      },
      borderRadius: {
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};
