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
      colors: {
        background: "#181a20",
        icon: "#A7A7A7",
        primary: "#4169e1",
        secondary: "#03c275",
        textPrimary: "#FFFFFF",
        textSecondary: "#E0E0E0",
      },
      fontFamily: {
        MonThin: ["thin"],
        MonRegular: ["regular"],
        MonMedium: ["medium"],
        MonBold: ["bold"],
      },
    },
  },
  plugins: [],
};
