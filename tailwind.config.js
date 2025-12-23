/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      background: "#1F222A",
      secondary: "",
      primary: "#4169e1",
      textPrimary: "#FFFFFF",
      textSecondary: "#E0E0E0",
    },
  },
  plugins: [],
};
