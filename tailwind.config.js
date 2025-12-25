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
        icon: "#A7A7A7",
        liveOne: "#1E4D5F",
        primary: "#4169e1",
        secondary: "#03c275",
        background: "#181a20",
        textPrimary: "#E4E7EC",
        textSecondary: "#E0E0E0",
      },
      fontFamily: {
        MonThin: ["thin"],
        MonBold: ["bold"],
        MonMedium: ["medium"],
        MonRegular: ["regular"],
      },
    },
  },
  plugins: [],
};
